import express from 'express';
import multer from 'multer';
import cors from 'cors';
import mongoose from 'mongoose';

import { loginValidation, registerValidation, postCreateValidation } from './validations.js';
import { PostController, UserController } from './controllers/index.js';
import { handleValiddationErrors, checkAuth } from './utils/index.js';

mongoose
    .connect('mongodb+srv://admin:12345@cluster0.vr3cq5n.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('DataBase OK!'))
    .catch((err) => console.log('DataBase Error', err));

const app = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValiddationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValiddationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.get('/posts', PostController.getAll);
app.get('/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValiddationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValiddationErrors, PostController.update);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    });
});

app.listen(4444, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log('Server OK');
});