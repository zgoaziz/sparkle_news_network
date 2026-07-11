import mongoose from "mongoose";
import * as schema from "./schema";

const { MONGODB_URI, DB_NAME } = process.env;

if (!MONGODB_URI || !DB_NAME) {
  throw new Error(
    "Variables DB manquantes. Vérifiez MONGODB_URI et DB_NAME dans le .env",
  );
}

let connection: typeof mongoose | null = null;

export async function connectDB() {
  if (connection) {
    return connection;
  }

  connection = await mongoose.connect(MONGODB_URI as string, {
    dbName: DB_NAME,
    family: 4, // Force IPv4 to avoid IPv6 ENETUNREACH issues
    serverSelectionTimeoutMS: 10000, // Fail fast if Atlas is unreachable (10s)
    socketTimeoutMS: 45000, // Keep socket alive longer
    connectTimeoutMS: 10000, // Initial connection timeout
    maxPoolSize: 10, // Maintain up to 10 connections
    minPoolSize: 2, // Keep minimum 2 connections warm
    heartbeatFrequencyMS: 10000, // Check connection health every 10s
  });

  console.log("Connected to MongoDB Atlas");
  return connection;
}

// Drizzle operator compatibility
export const eq = (field: any, value: any) => ({ [field]: value });
export const and = (...conditions: any[]) => ({ $and: conditions });
export const or = (...conditions: any[]) => ({ $or: conditions });
export const asc = (field: string) => ({ [field]: "asc" });
export const desc = (field: string) => ({ [field]: "desc" });

function convertDrizzleToMongo(conditions: any): any {
  if (!conditions) return {};
  if (typeof conditions === "object" && !Array.isArray(conditions)) {
    const keys = Object.keys(conditions);
    if (keys.length === 1) {
      const key = keys[0];
      const value = conditions[key];
      if (typeof key === "string" && !key.startsWith("$")) {
        return { [key]: value };
      }
    }
  }
  return conditions;
}

class DrizzleCompat {
  constructor(private model?: any) {}

  from(model: any) {
    this.model = model;
    return this;
  }

  select(...fields: string[]) {
    this.selectedFields = fields;
    return this;
  }

  where(conditions: any) {
    this.conditions = convertDrizzleToMongo(conditions);
    return this;
  }

  orderBy(field: any) {
    this.orderField = field;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async execute() {
    let query = this.model.find(this.conditions || {});

    if (this.selectedFields && this.selectedFields.length > 0) {
      query = query.select(this.selectedFields.join(" "));
    }

    if (this.orderField) {
      const orderKey = Object.keys(this.orderField)[0];
      const orderValue = Object.values(this.orderField)[0];
      query = query.sort({ [orderKey]: orderValue === "asc" ? 1 : -1 });
    }

    if (this.limitCount) {
      query = query.limit(this.limitCount);
    }

    return await query.exec();
  }

  async first() {
    let query = this.model.findOne(this.conditions || {});

    if (this.selectedFields && this.selectedFields.length > 0) {
      query = query.select(this.selectedFields.join(" "));
    }

    return await query.exec();
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): Promise<any | TResult> {
    return this.execute().catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<any> {
    return this.execute().finally(onfinally);
  }

  private selectedFields?: string[];
  private conditions?: any;
  private orderField?: any;
  private limitCount?: number;
}

class DrizzleUpdateCompat {
  constructor(private model: any) {}
  private data: any;
  private conditions: any;
  private returningFlag = false;

  set(data: any) {
    this.data = data;
    return this;
  }

  where(conditions: any) {
    this.conditions = convertDrizzleToMongo(conditions);
    return this;
  }

  returning() {
    this.returningFlag = true;
    return this;
  }

  async execute() {
    if (this.returningFlag) {
      const query = this.conditions || {};
      const updated = await this.model
        .findOneAndUpdate(query, { $set: this.data }, { new: true })
        .exec();
      return updated ? [updated] : [];
    } else {
      await this.model
        .updateMany(this.conditions || {}, { $set: this.data })
        .exec();
      return [];
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): Promise<any | TResult> {
    return this.execute().catch(onrejected);
  }
}

class DrizzleDeleteCompat {
  constructor(private model: any) {}
  private conditions: any;
  private returningFlag = false;

  where(conditions: any) {
    this.conditions = conditions;
    return this;
  }

  returning() {
    this.returningFlag = true;
    return this;
  }

  async execute() {
    if (this.returningFlag) {
      const deleted = await this.model
        .findOneAndDelete(this.conditions || {})
        .exec();
      return deleted ? [deleted] : [];
    } else {
      await this.model.deleteMany(this.conditions || {}).exec();
      return [];
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): Promise<any | TResult> {
    return this.execute().catch(onrejected);
  }
}

class DrizzleInsertCompat {
  constructor(private model: any) {}
  private data: any;
  private returningFlag = false;

  values(data: any) {
    this.data = data;
    return this;
  }

  returning() {
    this.returningFlag = true;
    return this;
  }

  async execute() {
    const docs = Array.isArray(this.data) ? this.data : [this.data];
    const inserted = await this.model.insertMany(docs);
    return this.returningFlag ? inserted : [];
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): Promise<any | TResult> {
    return this.execute().catch(onrejected);
  }
}

export const db = {
  connect: connectDB,
  connection: () => mongoose.connection,
  disconnect: () => mongoose.disconnect(),
  select: (model?: any) => new DrizzleCompat(model),
  update: (model: any) => new DrizzleUpdateCompat(model),
  delete: (model: any) => new DrizzleDeleteCompat(model),
  insert: (model: any) => new DrizzleInsertCompat(model),
};

export * from "./schema";
