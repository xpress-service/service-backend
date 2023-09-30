# service-backend
"mongoose": "^7.4.2"
get request http://localhost:5000/api/users/vendors?category=fishing
post request http://localhost:5000/api/users/vendors body={name, category, location}
Transactions
create method POST
http://localhost:5000/api/users/transactions
{
    "userId": 1,
    "vendorId": 4,
    "amount": 1000
}

get all Transactions
method get
http://localhost:5000/api/users/transactions admin permission

get all transactions for a particular user
http://localhost:5000/api/users/transactions/2
ORDERS
GET ORDERS
http://localhost:5000/api/orders
CREATE ORDERS
http://localhost:5000/api/orders
{
    userId, vendorId, category
}
UPDATE ORDER STATUS
http://localhost:5000/api/orders/{order_id}
{
    status
}
GET DETAILS OF AN ORDER
http://localhost:5000/api/orders/{order_id}

SIGN IN 
http://localhost:5000/api/auth/signin
{
    email, password
}
