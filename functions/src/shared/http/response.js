const FUNCTION_BUILD_VERSION = 'orcamentos-crud-cors-v2';

function buildHeaders() {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,x-functions-key',
        'X-Orcamentos-Functions-Version': FUNCTION_BUILD_VERSION
    };
}

function jsonResponse(body, status = 200) {
    return {
        status,
        headers: buildHeaders(),
        body: JSON.stringify({
            ...body,
            functionVersion: FUNCTION_BUILD_VERSION
        })
    };
}

function emptyResponse(status = 200) {
    return {
        status,
        headers: buildHeaders(),
        body: JSON.stringify({ functionVersion: FUNCTION_BUILD_VERSION })
    };
}

module.exports = {
    emptyResponse,
    jsonResponse
};
