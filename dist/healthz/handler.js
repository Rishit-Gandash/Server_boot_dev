export async function handlerReadiness(req, res) {
    res.set('Content-Type', 'text/plain');
    res.status(200);
    res.send('200 OK');
}
