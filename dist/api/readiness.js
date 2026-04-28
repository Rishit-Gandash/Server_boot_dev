export async function handlerReadiness(_, res) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.status(200);
    res.send('OK');
}
