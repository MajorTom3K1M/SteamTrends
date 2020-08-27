const express = require('express');
const webpack = require('webpack');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');
const steam = require('./lib/steam');
const mongoose = require('mongoose');

const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const historyApiFallback = require('connect-history-api-fallback');
const webpackConfig = require('./webpack.config');

const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/steamdb', { useNewUrlParser: true })
    .then(() => console.log("Conected to mongodb"))
    .catch(() => console.log("Error to connected"));
mongoose.Promise = global.Promise;

app.set('port', process.env.PORT || 3001);
app.use(bodyParser.urlencoded({ extended: false }));

const compiler = webpack(webpackConfig);

app.use(historyApiFallback({
    verbose: false
}));

app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: path.resolve(__dirname, 'client/public'),
    stats: {
        colors: true,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false,
        modules: false
    }
}));

app.use(webpackHotMiddleware(compiler));
app.use(express.static(path.resolve(__dirname, '../dist')));

// development error handler
// will print stacktrace
app.use((err, req, res, next) => {
    console.error(colors.red(err.stack));
    res.status(err.status || 500);
});

cron.schedule('0 30 */12 * * *', () => {
    steam.UpdateAppsDatabase();
});

cron.schedule('0 0 */1 * * *', () => {
    steam.TrackingConcurrentPlayer();
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
    console.log(`listen to port ${app.get('port')}`);
});
