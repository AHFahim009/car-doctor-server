/* 

* explore documentation: https://github.com/auth0/node-jsonwebtoken

why we use json web token (jwt)=>

Authentication: JWT provide a secure method for user authentication. When a user logs in, the server generates a JWT containing the user's identity and any relevant information. This token is then sent back to the client, usually stored in local storage or a cookie. On subsequent requests, the client includes the JWT in the Authorization header, allowing the server to authenticate the user based on the token's integrity and validity.

first process:
! get jwt token from server site when a user logged from client site

* [ (create) => loggedUser data to server site "/jwt" & res.send =>  jwt.sign()  / set the token in local storage ]

jwt process will be:

step 1: require jsonwebtoken

step 2: create secret token 

step 3: when user logged => hit "/jwt" server / create loggedUser data from  clint site to server site "/jwt"
 
step 4:  jwt.sign(payload, secret, {expiresIn:}) =>

const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5h",
      });

step 5: res.send => step 4 

 
after res.send => in client site  =>
 
if user observed in onAuthStateChange =>
set token in local storage
else 
remove this token from local storage
 
------------------------------

second step:
! when will we  verify the jwt token ?

* verify jwt token => when user  will go (NewBookings route) only access to his personal booking related data  :


 * [(res.send) => find some bookings data only user.email related from server site       ("/booking") / send jwt token form local storage => to server site ("/booking") /  process => jwt.verify(token) in  server "/bookings" ]

 ==>

in client site=>
 step 1: (res.send) => when find some bookings data only user.email related from server site  ("/booking") 
  
 then

step 2: send jwt token form local storage => to server site ("/booking") in =>
   headers: {
        authorization: `Bearer ${localStorage.getItem("car-access-token")}`,
      },
  
 step 3: then server site process jwt.verify(token) in  server "/bookings" =>

 * create a function called verifyJWT (as a  middleware) and call it in "/bookings"
 1. it will have three parameters( req, res, nest)
 2. first check authorization headers exits
 3. if not return 401
 4. split only secret token part from headers
 5. call jwt.verify => 
 
 jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res
        .status(401)
        .send({ error: true, massage: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });

  6: now verify decoded.email == req.query.email
  if not then send error =>
  const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        return res.status(403).send({ error: 1, massage: "invalid user" });
      }



































*/
