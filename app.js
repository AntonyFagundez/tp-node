const express = require('express');
const app = express();
const session = require('express-session');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');

app.engine('hbs', exphbs());
app.set('view engine', 'hbs');
app.use(session({ secret: 'H0laC0m03st4S' }));
app.use(express.urlencoded());

mongoose.connect('mongodb://localhost:27017/login', { useNewUrlParser: true, useUnifiedTopology: true });

var usuarioSchema = mongoose.Schema({
    usuario: String,
    email: String,
    password: String,
});
var Usuario = mongoose.model('Usuario', usuarioSchema);

var novedadSchema = mongoose.Schema({
    usuario: String,
    messge: String,
});
var Novedad = mongoose.model('Novedad', novedadSchema);


app.get('/sign_up', (req, res) => {
    res.render('registro');
});

app.post('/sign_up', async (req, res) => {
    var user = new Usuario();
    user.usuario = req.body.usuario;
    user.email = req.body.email;
    user.password = req.body.password;
    await user.save();
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    if (req.session.usuario_id) {
        res.redirect('/home');
        return;
    }
    res.render('login');
});

app.post('/login', async (req, res) => {
    var user = await Usuario.findOne({ usuario: req.body.usuario, password: req.body.password });
    if (user) {
        req.session.usuario_id = user._id;
        req.session.usuario = user.usuario;
        res.redirect('/home');
    } else {
        res.render('login', { mensaje_error: 'Usuario/Password incorrecto', usuario: req.body.usuario });
    }
});

app.get('/home', async (req, res) => {
    if (!req.session.usuario_id) {
        res.redirect('/login');
        return;
    }
    var novedades = await Novedad.find();
    res.render('home', { usuario: req.session.usuario, novedades: novedades });
});

app.post('/home', async (req, res) => {
    var messge = new Novedad();
    messge.messge = req.body.messge;
    messge.usuario = req.session.usuario;
    await messge.save();
    var novedades = await Novedad.find();
    var usuario = req.session.usuario;
    res.render('home', { novedades, usuario });
});

app.get('/logout', async (req, res) => {

    await req.session.destroy();
    res.redirect('/login')
});

app.listen(3000, () => {
    console.log("App on in port 3000");
});