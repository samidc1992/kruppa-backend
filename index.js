const http = require('http');
const { createApp } = require('./cleanArchApp');

const main = async () => {
    const app = await createApp();
    http.createServer(app).listen(3000);
}
main()
.then(() => console.log('App started'))
