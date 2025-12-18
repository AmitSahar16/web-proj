import { Response } from 'express';
import { Model, Document, FilterQuery } from 'mongoose';
import mongoose from 'mongoose';

export const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

export const getById = async <T extends Document>(
  model: Model<T>,
  id: any,
  res: Response,
  populateOptions?: string | string[],
  selectOptions?: string,
): Promise<void> => {
  try {
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid id' });
      return;
    }

    let query = model.findById(id);
    
    if (selectOptions) {
      query = query.select(selectOptions) as any;
    }
    
    if (populateOptions) {
      query = query.populate(populateOptions) as any;
    }

    const entity = await query;

    if (!entity) {
      res.status(404).json({ message: `${model.modelName} not found` });
      return;
    }

    res.json(entity);
  } catch (err: any) {
    console.error(`error get by id ${model.modelName}`, err);
    res.status(500).json({ message: err.message });
  }
};

export const getAll = async <T extends Document>(
  model: Model<T>,
  res: Response,
  query?: FilterQuery<T>,
  populateOptions?: string | string[],
  selectOptions?: string,
): Promise<void> => {
  try {
    let findQuery = model.find(query || {}).sort({ createdAt: -1 });
    
    if (selectOptions) {
      findQuery = findQuery.select(selectOptions) as any;
    }
    
    if (populateOptions) {
      findQuery = findQuery.populate(populateOptions) as any;
    }

    const entities = await findQuery;

    res.json(entities);
  } catch (err: any) {
    console.error(`error get all ${model.modelName}`, err);
    res.status(500).json({ message: err.message });
  }
};

export const create = async <T extends Document>(
  model: Model<T>,
  body: any,
  res: Response,
  filterFindOne?: FilterQuery<T>,
  populateOptions?: string | string[],
): Promise<void> => {
  try {
    if (filterFindOne) {
      const existingEntity = await model.findOne(filterFindOne);

      if (existingEntity) {
        res.status(409).json({ message: `${model.modelName} already exists` });
        return;
      }
    }

    const entity = await model.create(body);

    if (populateOptions) {
      await (entity as any).populate(populateOptions);
    }

    res.status(201).json(entity);
  } catch (err: any) {
    console.error(`error create ${model.modelName}`, err);
    res.status(400).json({ message: err.message });
  }
};

export const updateById = async <T extends Document>(
  model: Model<T>,
  id: any,
  body: any,
  res: Response,
  populateOptions?: string | string[],
  selectOptions?: string,
): Promise<void> => {
  try {
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid id' });
      return;
    }

    let query = model.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (selectOptions) {
      query = query.select(selectOptions) as any;
    }

    if (populateOptions) {
      query = query.populate(populateOptions) as any;
    }

    const updatedEntity = await query;

    if (!updatedEntity) {
      res.status(404).json({ message: `${model.modelName} not found` });
      return;
    }

    res.json(updatedEntity);
  } catch (err: any) {
    console.error(`error update ${model.modelName}`, err);
    res.status(400).json({ message: err.message });
  }
};

export const deleteById = async <T extends Document>(
  model: Model<T>,
  id: any,
  res: Response
): Promise<void> => {
  try {
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid id' });
      return;
    }

    const deleted = await model.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: `${model.modelName} not found` });
      return;
    }

    res.json({ message: `${model.modelName} deleted` });
  } catch (err: any) {
    console.error(`error delete ${model.modelName}`, err);
    res.status(500).json({ message: err.message });
  }
};

