# RESTfull API

### What is REST?

Representational State Transfer (REST) == software architecture style that defines a set of constraints to be used for creating web services.
Web services that conform to the REST are called `RESTfull web services`

### Architectural constraints

1. Client-server architecture:
   - UI concerns are separated from the data storage
   - improves portability of the UI across platforms

2. Statelessness:
   - Each request from any client contains all the info necessary to serve the request
   - the session state is held in the client.

3. Cacheability:
   - clients and intermediaries can cache responses.
   - Good caching reduces/eliminates some client-server interactions.
   - Improves scalability and performance.

4. Layered system:
   - client cannot tell whether is connected to the end server or an intermediate one.
   - Intermediary servers can improve system scalability by load balancing and sharing caches + enforce security policies.

5. Code of demand(optional):
   - servers can temporarily extend/customize the functionality of a client by transferring executable code (client side scripts -- JS, compiled components -- Java applets)

6. Uniform interface:
   - uniform interface constraint is fundamental to RESTful system design.
   - simplifies and decouples the architecture.
   - each part of the system evolves independently.

### HTTP-based RESTful APIs

Web service API that adhere(follow) the REST architectural constraints are called RESTful APIs.
HTTP-based RESTful APIs are defined with:

- A base URI (Universal Resource Identifier) `https://example.com/` then `example.com/login`, `/account/userId`
- Standart HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Media type that defines state transition data elements (JSON/XML) Единый вид обмениваемой информации.


### HTTP methods in a RESTful API

- GET: fetch data, read and parse data requested in the body.
- POST: send forms, files, create new records from request body
- PUT: replace existing/create new record with data from request body
- PATCH: partially update fields, where record exists (fields and data specified in body)
- DELETE: remove a record

`GET /customers` == fetch all customers
`GET /customers/<id>` == fetch data of specific customer
`POST /customers` == create new customer
`PUT /customers/<id>` == replace a record on specific customer
`PATCH /customers/<id>` == partial update customer
`DELETE /customers/<id>` == delete a customer by id