with open('srs.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Exact line replacements
content = content.replace(
    'System queries data in all tables that relate to incomes,...  in the database (Refer to “Order” table,... in “DB Sheet” file).',
    'System queries data in all collections that relate to incomes in the database (Refer to Order, Invoice, and Payment collections).'
)

content = content.replace(
    'The database checks if the provided data follows the table constraints in “CUSTOMER” table (Refer to “DB Sheet” file).',
    'The database checks if the provided data follows the model constraints in the Customer collection.'
)

content = content.replace(
    'Else, the system moves to step (2.2) and sends the search keyword to the database by function SearchGoods(keyword) to check if any goods in the database match the search criteria (Refer to “Goods” table in “DB Sheet” file).',
    'Else, the system moves to step (2.2) and sends the search keyword to the backend via search API to check if any products match the search criteria in the Product collection.'
)

content = content.replace(
    '❖ The SearchGoods function queries the Product collection in DB (Refer to “Goods” table in “DB Sheet” file) for partial match on name / description.',
    '❖ The SearchGoods function queries the Product collection in the database for a partial match on name or description.'
)

content = content.replace(
    ' ❖ On load, call loadAssignedOrders() / loadOrderDetails()  to query data in the DeliveryOrder collection in the database with syntax  “SELECT * FROM Customer WHERE deliveryOrderID = [DeliveryOrder.ID] && staff_ID = [Staff.ID]“ with [DeliveryOrder.ID] is retrieved from the item clicked on the datagrid.',
    ' ❖ On load, call loadAssignedOrders() / loadOrderDetails() to query data in the DeliveryOrder collection in the database using Mongoose: DeliveryOrder.findOne({ _id: deliveryOrderId, staff_id: staffId }).'
)

# Line 2437:
content = content.replace(
    'to retrieve full item information from the “Goods” table in the database.',
    'to retrieve full item information from the Product collection in the database.'
)

with open('srs.txt', 'w', encoding='utf-8') as f:
    f.write(content)

print("Final replacements done!")
