const sharp  = require("sharp")
const glob = require("glob")
const path = require("path")
const fse = require("fs-extra")


const files = glob.sync("./panorams/**/*.jpg", {
	nodir: true
});

handleConvertion(files);

async function handleConvertion(files){
	try{

		for(let filePath of files){
			const p = path.parse(filePath);
			path.delimiter = "/"
			const saveDir = path.posix.join("./avif", p.dir, `${p.name}.avif`)
			const temp = path.parse(saveDir)
			await fse.ensureDir(temp.dir)

			
			await sharp(filePath)
			.rotate()
			.avif()
			.toFile(saveDir)
			.catch(err => console.log(err))

			console.log({saveDir})
		}
	}catch(err){
		console.error(err)
	}
}

// sharp('./images/0-1.jpg')
//   .rotate()
//   .avif()
//   .toFile('./output.avif')