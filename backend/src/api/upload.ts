import multer from 'multer';
import { UPLOADED_DIR } from '../lib/paths';

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, UPLOADED_DIR);
    },
    filename: function (_req, file, cb) {
        const fileName = new Date().getTime().toString();
        const ext = file.originalname.split('.').pop();
        cb(null, `${fileName}.${ext}`);
    },
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
    res.json({ path: `/files/uploaded/${req.file!.filename}` });
});
