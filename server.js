require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


let db;

connectToDb()
  .then((database) => {
    db = database;
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// GET Vehicles
app.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await db.collection('vehicles').find().toArray();

    const vehicleIds = vehicles.map((v) => v._id);

    const images = await db
      .collection('vehicleImages')
      .find({ vehicleId: { $in: vehicleIds } })
      .toArray();

    const imagesByVehicle = images.reduce((acc, img) => {
      const key = img.vehicleId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(img);
      return acc;
    }, {});

    const result = vehicles.map((v) => ({
      ...v,
      images: imagesByVehicle[v._id.toString()] || [],
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get vehicles' });
  }
});

app.post('/vehicles', async (req, res) => {
  try {
    const {
      title,
      year,
      make,
      model,
      trim,
      price,
      mileage,
      available = true,
      description,
      mainImageUrl,
      images = [],
    } = req.body;

    const now = new Date();

    // Insert vehicle
    const vehicleResult = await db.collection('vehicles').insertOne({
      title,
      year,
      make,
      model,
      trim,
      price,
      mileage,
      available,
      description,
      mainImageUrl,
      createdAt: now,
      updatedAt: now,
    });

    if (mainImageUrl) {
    await db.collection('vehicleImages').insertOne({
        vehicleId: vehicleResult.insertedId, 
        imageUrl: mainImageUrl,
        altText: title || '',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
    });
    }

    const vehicleId = vehicleResult.insertedId;

    // Insert images
    if (images.length > 0) {
      const imagesWithVehicleId = images.map((img, index) => ({
        vehicleId,
        imageUrl: img.imageUrl,
        altText: img.altText || '',
        sortOrder: index,
      }));
      await db.collection('vehicleImages').insertMany(imagesWithVehicleId);
    }

    res.status(201).json({ message: 'Vehicle created', vehicleId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// PUT Vehicles by ID
app.put('/vehicles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const vehicleObjectId = new ObjectId(id);

    const updates = {
      ...req.body,
      updatedAt: new Date(),
    };

    const result = await db
      .collection('vehicles')
      .updateOne({ _id: vehicleObjectId }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (req.body.mainImageUrl !== undefined) {
      console.log('Syncing vehicleImages for vehicle', id, 'to', req.body.mainImageUrl);

      await db.collection('vehicleImages').updateOne(
        { vehicleId: vehicleObjectId, sortOrder: 1 },
        {
          $set: {
            imageUrl: req.body.mainImageUrl,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            vehicleId: vehicleObjectId,
            sortOrder: 1,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    return res.json({ message: 'Vehicle updated' });
  } catch (err) {
    console.error('Error updating vehicle:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE by ID
app.delete('/vehicles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const objectId = new ObjectId(id);

    const vehicleResult = await db
      .collection('vehicles')
      .deleteOne({ _id: objectId });

    const imageResult = await db
      .collection('vehicleImages')
      .deleteMany({ vehicleId: objectId });

    if (vehicleResult.deletedCount === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({
      message: 'Vehicle and related images deleted',
      imagesDeleted: imageResult.deletedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});
