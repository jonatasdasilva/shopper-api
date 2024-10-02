import { writeFile } from 'fs/promises';
import { env } from '../../env';

function mime(base64: string): string {
  //detect type of image
  let mime: string = '';
  let types_image = {
    iVBORw0KGgo: "image/png",
    "/9j/": "image/jpg"
  };

  for (let t in types_image) {
    if (base64.indexOf(t) === 0)
      mime = types_image[t];
    else
      mime = "image/jpeg"
  }

  return mime;
}

async function upload(base64: string, measure_type: string, date_time: string): Promise<object> {
  const mimeType = mime(base64);
  // generate name of file
  const name = `${measure_type.toLocaleLowerCase()}-${Date.parse(date_time) / 1000}.${mimeType.split('/')[1]}`;
  // determinate path of file
  const filePath = `${env.ROOT}/uploads/${name}`;
  //remove prefix to base64
  const base64Image = base64.replace(/^data:image\/\w+;base64,/, '');
  //generate buffer to base64 image
  const imageBuffered = Buffer.from(base64Image, 'base64');
  // connect to Gemini file manager
  await writeFile(filePath, imageBuffered);

  return ({ image: imageBuffered, filePath: filePath, typeFile: mimeType, fileName: name });
}

export { upload, mime };