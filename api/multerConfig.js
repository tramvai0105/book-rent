import multer from "multer";
const storage = multer.diskStorage({
    destination: "files/",
    filename: function (req, file, callback) {
        callback(null, Date.now() + ".jpg");
    }
});
export const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/; // Разрешенные типы файлов
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb('Ошибка: Файл должен быть изображением (jpeg, jpg, png, gif).');
};

export default storage