"""
Data migration script to add organization_id to existing records
This script assigns records without organization_id to their respective user's organization
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "stock_master"

async def migrate_data():
    """Migrate existing data to add organization_id"""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print("Starting data migration...")
    print("=" * 60)
    
    # Get all users and their organizations
    users = await db.users.find({}).to_list(length=None)
    user_org_map = {user["email"]: user.get("organization_id") for user in users if "organization_id" in user}
    
    print(f"Found {len(users)} users")
    print(f"Users with organization: {len(user_org_map)}")
    print()
    
    # Migrate Products
    print("Migrating Products...")
    products_without_org = await db.products.find({"organization_id": {"$exists": False}}).to_list(length=None)
    print(f"Found {len(products_without_org)} products without organization_id")
    
    products_updated = 0
    for product in products_without_org:
        created_by = product.get("created_by")
        if created_by and created_by in user_org_map:
            org_id = user_org_map[created_by]
            await db.products.update_one(
                {"_id": product["_id"]},
                {"$set": {"organization_id": org_id}}
            )
            products_updated += 1
    print(f"Updated {products_updated} products")
    print()
    
    # Migrate Warehouses
    print("Migrating Warehouses...")
    warehouses_without_org = await db.warehouses.find({"organization_id": {"$exists": False}}).to_list(length=None)
    print(f"Found {len(warehouses_without_org)} warehouses without organization_id")
    
    warehouses_updated = 0
    for warehouse in warehouses_without_org:
        # Assign to first user's organization as default
        if user_org_map:
            first_org_id = list(user_org_map.values())[0]
            await db.warehouses.update_one(
                {"_id": warehouse["_id"]},
                {"$set": {"organization_id": first_org_id}}
            )
            warehouses_updated += 1
    print(f"Updated {warehouses_updated} warehouses")
    print()
    
    # Migrate Locations
    print("Migrating Locations...")
    locations_without_org = await db.locations.find({"organization_id": {"$exists": False}}).to_list(length=None)
    print(f"Found {len(locations_without_org)} locations without organization_id")
    
    locations_updated = 0
    for location in locations_without_org:
        # Match location to warehouse's organization
        warehouse_id = location.get("warehouse_id")
        if warehouse_id:
            warehouse = await db.warehouses.find_one({"_id": warehouse_id})
            if warehouse and "organization_id" in warehouse:
                await db.locations.update_one(
                    {"_id": location["_id"]},
                    {"$set": {"organization_id": warehouse["organization_id"]}}
                )
                locations_updated += 1
    print(f"Updated {locations_updated} locations")
    print()
    
    # Migrate Stock Movements
    print("Migrating Stock Movements...")
    movements_without_org = await db.stock_movements.find({"organization_id": {"$exists": False}}).to_list(length=None)
    print(f"Found {len(movements_without_org)} stock movements without organization_id")
    
    movements_updated = 0
    for movement in movements_without_org:
        created_by = movement.get("created_by")
        if created_by and created_by in user_org_map:
            org_id = user_org_map[created_by]
            await db.stock_movements.update_one(
                {"_id": movement["_id"]},
                {"$set": {"organization_id": org_id}}
            )
            movements_updated += 1
    print(f"Updated {movements_updated} stock movements")
    print()
    
    # Migrate Stock Ledger
    print("Migrating Stock Ledger...")
    ledger_without_org = await db.stock_ledger.find({"organization_id": {"$exists": False}}).to_list(length=None)
    print(f"Found {len(ledger_without_org)} stock ledger entries without organization_id")
    
    ledger_updated = 0
    for entry in ledger_without_org:
        created_by = entry.get("created_by")
        if created_by and created_by in user_org_map:
            org_id = user_org_map[created_by]
            await db.stock_ledger.update_one(
                {"_id": entry["_id"]},
                {"$set": {"organization_id": org_id}}
            )
            ledger_updated += 1
    print(f"Updated {ledger_updated} stock ledger entries")
    print()
    
    print("=" * 60)
    print("Migration Summary:")
    print(f"  Products updated: {products_updated}")
    print(f"  Warehouses updated: {warehouses_updated}")
    print(f"  Locations updated: {locations_updated}")
    print(f"  Stock movements updated: {movements_updated}")
    print(f"  Stock ledger entries updated: {ledger_updated}")
    print(f"  Total records updated: {products_updated + warehouses_updated + locations_updated + movements_updated + ledger_updated}")
    print("=" * 60)
    print("Migration completed successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_data())
