import { Router, Response } from 'express';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { User, Lead } from './models';

import {
  authenticateJWT,
  authorizeRoles,
  asyncHandler,
  AuthenticatedRequest
} from './middleware';

import { config } from './config';

export const router = Router();

/* =========================
   AUTH - REGISTER
========================= */

router.post(
  '/auth/register',

  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response
    ) => {
      const {
        name,
        email,
        password,
        role
      } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          error: 'All fields are required'
        });
      }

      const existingUser =
        await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          error: 'Email already exists'
        });
      }

      const passwordHash =
        await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        passwordHash,
        role:
          role === 'Admin'
            ? 'Admin'
            : 'Sales User'
      });

      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role
        },

        config.JWT_SECRET,

        {
          expiresIn: '1d'
        }
      );

      res.status(201).json({
        token,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  )
);

/* =========================
   AUTH - LOGIN
========================= */

router.post(
  '/auth/login',

  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response
    ) => {
      const { email, password } =
        req.body;

      if (!email || !password) {
        return res.status(400).json({
          error:
            'Email and password required'
        });
      }

      const user =
        await User.findOne({ email });

      if (
        !user ||
        !(await bcrypt.compare(
          password,
          user.passwordHash
        ))
      ) {
        return res.status(401).json({
          error: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role
        },

        config.JWT_SECRET,

        {
          expiresIn: '1d'
        }
      );

      res.json({
        token,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  )
);

/* =========================
   CREATE LEAD
========================= */

router.post(
  '/leads',

  authenticateJWT,

  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response
    ) => {
      const {
        name,
        email,
        status,
        source
      } = req.body;

      if (
        !name ||
        !email ||
        !status ||
        !source
      ) {
        return res.status(400).json({
          error: 'All fields required'
        });
      }

      const lead = await Lead.create({
        name,
        email,
        status,
        source,
        createdBy: req.user!.userId
      });

      res.status(201).json(lead);
    }
  )
);

/* =========================
   GET ALL LEADS
========================= */

router.get(
  '/leads',

  authenticateJWT,

  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response
    ) => {
      const {
        status,
        source,
        search,
        sort,
        page = '1'
      } = req.query;

      const queryBuild: Record<string, any> = {};

      if (status) {
        queryBuild.status = status;
      }

      if (source) {
        queryBuild.source = source;
      }

      if (search) {
        queryBuild.$or = [
          {
            name: {
              $regex: search,
              $options: 'i'
            }
          },

          {
            email: {
              $regex: search,
              $options: 'i'
            }
          }
        ];
      }

      const sortOrder =
        sort === 'oldest' ? 1 : -1;

      const limitValue = 10;

      const currentPage =
        parseInt(page as string) || 1;

      const skipValue =
        (currentPage - 1) * limitValue;

      const totalRecords =
        await Lead.countDocuments(queryBuild);

      const leads = await Lead.find(queryBuild)
        .sort({ createdAt: sortOrder })
        .skip(skipValue)
        .limit(limitValue);

      res.json({
        data: leads,

        metadata: {
          totalRecords,
          currentPage,
          totalPages: Math.ceil(
            totalRecords / limitValue
          ),
          limit: limitValue
        }
      });
    }
  )
);

/* =========================
   GET SINGLE LEAD
========================= */

router.get(
  '/leads/:id',

  authenticateJWT,

  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response
    ) => {
      const lead = await Lead.findById(
        req.params.id
      );

      if (!lead) {
        return res.status(404).json({
          error: 'Lead not found'
        });
      }

      res.json(lead);
    }
  )
);

/* =========================
   UPDATE LEAD
========================= */

router.put(
  '/leads/:id',

  authenticateJWT,

  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response
    ) => {
      const lead =
        await Lead.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true
          }
        );

      if (!lead) {
        return res.status(404).json({
          error: 'Lead not found'
        });
      }

      res.json(lead);
    }
  )
);

/* =========================
   DELETE LEAD
========================= */

router.delete(
  '/leads/:id',

  authenticateJWT,

  authorizeRoles('Admin'),

  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response
    ) => {
      const lead =
        await Lead.findByIdAndDelete(
          req.params.id
        );

      if (!lead) {
        return res.status(404).json({
          error: 'Lead not found'
        });
      }

      res.json({
        message: 'Lead deleted'
      });
    }
  )
);

/* =========================
   EXPORT CSV
========================= */

router.get(
  '/leads/export',

  authenticateJWT,

  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response
    ) => {
      const leads = await Lead.find({});

      let csv =
        'Name,Email,Status,Source,CreatedAt\n';

      leads.forEach((lead) => {
        csv +=
          `${lead.name},` +
          `${lead.email},` +
          `${lead.status},` +
          `${lead.source},` +
          `${lead.createdAt}\n`;
      });

      res.header(
        'Content-Type',
        'text/csv'
      );

      res.attachment('leads.csv');

      res.send(csv);
    }
  )
);