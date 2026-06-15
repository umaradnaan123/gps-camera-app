import piexif from 'piexifjs';

function decimalToDms(dec: number): number[][] {
  const d = Math.floor(dec);
  const minDec = (dec - d) * 60;
  const m = Math.floor(minDec);
  const s = Math.round((minDec - m) * 60 * 100);
  return [
    [d, 1],
    [m, 1],
    [s, 100],
  ];
}

export async function writeExifToBlob(
  imageBlob: Blob,
  lat: number,
  lon: number,
  options?: { date?: string; time?: string; make?: string; model?: string }
): Promise<Blob> {
  // Only process JPEGs as EXIF structures are standard for JPEG
  if (imageBlob.type !== 'image/jpeg' && imageBlob.type !== 'image/jpg') {
    return imageBlob;
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(imageBlob);
  });

  const zeroth: Record<number, any> = {};
  const exif: Record<number, any> = {};
  const gps: Record<number, any> = {};

  // Convert decimal coordinates to Degree-Minute-Second array format for EXIF
  gps[piexif.GPSIFD.GPSLatitudeRef] = lat < 0 ? 'S' : 'N';
  gps[piexif.GPSIFD.GPSLatitude] = decimalToDms(Math.abs(lat));

  gps[piexif.GPSIFD.GPSLongitudeRef] = lon < 0 ? 'W' : 'E';
  gps[piexif.GPSIFD.GPSLongitude] = decimalToDms(Math.abs(lon));

  // Add Date/Time
  if (options?.date && options?.time) {
    const formattedDateTime = `${options.date.replace(/-/g, ':')} ${options.time}:00`;
    exif[piexif.ExifIFD.DateTimeOriginal] = formattedDateTime;
  }

  // Add Camera info
  if (options?.make) {
    zeroth[piexif.ImageIFD.Make] = options.make;
  }
  if (options?.model) {
    zeroth[piexif.ImageIFD.Model] = options.model;
  }

  const exifObj = { '0th': zeroth, 'Exif': exif, 'GPS': gps };

  try {
    const exifBytes = piexif.dump(exifObj);
    const newJpegDataUrl = piexif.insert(exifBytes, dataUrl);

    // Convert data URL back to Blob
    const response = await fetch(newJpegDataUrl);
    return await response.blob();
  } catch (err) {
    console.warn('Failed to embed EXIF tags into image blob:', err);
    return imageBlob;
  }
}
