# HTTP server using NodeJS

Node js can be used to create a HTTP server and more
Server can include databases, sites, real-time telemetry

### Routing

Routing -- determining how an app endpoints (URIs server side) respond to client requests.

Endpoint -- is a Uniform Resource Identifier (URI) or path and a specific HTTP request method.

Routes are defined as paths that can be requested and will return a response. (normally in JSON format, routes can be accessed vie the url)

Server listens for requests that match the specified routes and when match is detected, calls the specified callback function for those routes. Once the funciton has completed, server returns the response to the client requesing it.

### Routes

Node.js takes time to get even one route working.

1. Import `url` and `fs`(filesystem) packages with `require()`. (they are preinstalled with node dist)
2. Make a Render/Send HTML function `renderHTML()`; it should also include basic error handling for debugging
3. Use `renderHTML()` with `module.exports={}`

An HTTP request is structured in 3 main sections:
1. HEAD -- http version, `Content-Type`, `Content-Length`
2. BODY -- the actual content (json/xml/html/binary data)
3. TRAILER -- idk, it's never mentioned.

### HTTP Response Codes

Request may be completed successfully or not, so there is a variation of codes, that define if the response has completed:

1. Information Response: 100 > 103
2. Successful Response: 200 > 226
3. Redirection Messages: 300 > 308
4. Client error response: 400 > 451
5. Server error response: 500 > 511

The first number defines category, the second two -- the possible reason

