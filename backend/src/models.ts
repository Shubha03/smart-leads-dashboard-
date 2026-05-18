import {
  Schema,
  model,
  Document
} from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Sales User';
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ['Admin', 'Sales User'],
      default: 'Sales User'
    }
  },
  {
    timestamps: true
  }
);

export const User = model<IUser>(
  'User',
  UserSchema
);

export interface ILead extends Document {
  name: string;
  email: string;
  status:
    | 'New'
    | 'Contacted'
    | 'Qualified'
    | 'Lost';

  source:
    | 'Website'
    | 'Instagram'
    | 'Referral';

  createdBy: Schema.Types.ObjectId;
}

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: [
        'New',
        'Contacted',
        'Qualified',
        'Lost'
      ],
      required: true
    },

    source: {
      type: String,
      enum: [
        'Website',
        'Instagram',
        'Referral'
      ],
      required: true
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Lead = model<ILead>(
  'Lead',
  LeadSchema
);