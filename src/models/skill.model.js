
import { DataTypes, Op } from "sequelize";
import sequelize from "../config/database.js";

const SkillModel = sequelize.define(
  "Skill",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        "technical",
        "professional",
        "industry",
        "transferable"
      ),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "skills",
    timestamps: true,
    underscored: true,
  }
);

export const findAll = async ({ search, category } = {}) => {
  const where = { isActive: true };

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (category) {
    where.category = category;
  }

  return SkillModel.findAll({
    where,
    order: [["name", "ASC"]],
  });
};

export const findActiveById = async (id) =>
  SkillModel.findOne({
    where: { id, isActive: true },
  });

export const create = async (data) => SkillModel.create(data);

export const update = async (id, data) => {
  const skill = await SkillModel.findOne({
    where: { id, isActive: true },
  });

  if (!skill) return null;

  await skill.update(data);
  return skill;
};

export const deactivate = async (id) => {
  const skill = await SkillModel.findOne({
    where: { id, isActive: true },
  });

  if (!skill) return null;

  await skill.update({ isActive: false });

  return { id: skill.id, name: skill.name };
};

export default SkillModel;
