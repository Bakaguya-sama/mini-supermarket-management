import re

with open('srs.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Remaining specific replacements
content = content.replace("[txtBoxSpeciality]", "category, price, and barcode input fields")
content = content.replace("[txtBoxBarcode]", "barcode input field")
content = content.replace("[txtBoxSearch]", "search input field")
content = content.replace("these [txtBox] above.", "these form input fields above.")
content = content.replace("all information in these [txtBox] above.", "all information in these form input fields above.")

# DB Sheet references
content = content.replace('Refer to "Order" table,... \nin "DB Sheet" file', 'Refer to Order, Invoice, and Payment collections')
content = content.replace('Refer to "Order" table,...\nin "DB Sheet" file', 'Refer to Order, Invoice, and Payment collections')
content = content.replace('Refer to “Order” table,… \nin “DB Sheet” file', 'Refer to Order, Invoice, and Payment collections')
content = content.replace('in the database (Refer to "Order" table,... \nin "DB Sheet" file)', 'in the database (Refer to Order, Invoice, and Payment collections)')
content = content.replace('in the database (Refer to “Order” table,… \nin “DB Sheet” file)', 'in the database (Refer to Order, Invoice, and Payment collections)')

# Line 1674 specifically:
content = content.replace('System queries data in all tables that relate to incomes,...  in the database (Refer to "Order" table,... \nin "DB Sheet" file).',
                          'System queries data in all collections that relate to incomes in the database (Refer to Order, Invoice, and Payment collections).')

# Line 2107:
content = content.replace('table constraints in "CUSTOMER" table (Refer to "DB Sheet" file).',
                          'model constraints in Customer collection.')

# Line 2180:
content = content.replace('Report collection. (Refer to "STAFF_REPORT" table in the "DB Sheet" file).',
                          'Report collection.')
content = content.replace('Report collection. (Refer to “STAFF_REPORT” table in the “DB Sheet” file).',
                          'Report collection.')

# Line 2292 & 2335:
content = content.replace('Report collection (Refer to “DB Sheet”).', 'Report collection.')
content = content.replace('Report collection (Refer to "DB Sheet").', 'Report collection.')

# Line 2427:
content = content.replace('check if any goods in the database match the search criteria (Refer to "Goods" table in "DB \nSheet" file).',
                          'check if any products match the search criteria in the Product collection.')
content = content.replace('check if any goods in the database match the search criteria (Refer to “Goods” table in “DB \nSheet” file).',
                          'check if any products match the search criteria in the Product collection.')

# Line 2488:
content = content.replace('queries the Goods table in DB (Refer to "Goods" table in "DB Sheet" file) for \npartial match on name / description.',
                          'queries the Product collection for a partial match on name or description.')
content = content.replace('queries the Goods table in DB (Refer to “Goods” table in “DB Sheet” file) for \npartial match on name / description.',
                          'queries the Product collection for a partial match on name or description.')

# Line 2529:
content = content.replace('queries the Goods table in DB (Refer to "Goods" table in "DB Sheet" file) to get the record.',
                          'queries the Product collection to get the record.')
content = content.replace('queries the Goods table in DB (Refer to “Goods” table in “DB Sheet” file) to get the record.',
                          'queries the Product collection to get the record.')

# Line 3880:
content = content.replace('with syntax  "SELECT * FROM Customer WHERE deliveryOrderID = [DeliveryOrder.ID] && staff_ID = [Staff.ID]" with [DeliveryOrder.ID] is retrieved from the item clicked on the datagrid.',
                          'using Mongoose: DeliveryOrder.findOne({ _id: deliveryOrderId, staff_id: staffId }).')
content = content.replace('with syntax  “SELECT * FROM Customer WHERE deliveryOrderID = [DeliveryOrder.ID] && staff_ID = [Staff.ID]” with [DeliveryOrder.ID] is retrieved from the item clicked on the datagrid.',
                          'using Mongoose: DeliveryOrder.findOne({ _id: deliveryOrderId, staff_id: staffId }).')

# Clean up other occurrences of Goods/Customer table (casing)
content = content.replace('Customer table in the database', 'Customer collection in the database')
content = content.replace('Goods table in the database', 'Product collection in the database')
content = content.replace('Goods table', 'Product collection')
content = content.replace('Customer table', 'Customer collection')
content = content.replace('Goods Table', 'Product collection')
content = content.replace('Customer Table', 'Customer collection')

with open('srs.txt', 'w', encoding='utf-8') as f:
    f.write(content)

print("Remaining updates complete!")
