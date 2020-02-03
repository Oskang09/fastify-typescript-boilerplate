import { Model, Table, Column, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({
    modelName: 'task',
    tableName: 'tasks',
    timestamps: true,
    freezeTableName: true,
    schema: 'ordorex'
})
class Task extends Model<Task> {

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number

    @Column(DataType.STRING)
    status: string

    // FK -> user.id
    @Column(DataType.INTEGER)
    reporter: number

    // FK -> user.id
    @Column(DataType.INTEGER)
    creator: number

    @CreatedAt
    createdAt: Date

    @UpdatedAt
    updatedAt: Date
}

export const TaskStatusPending = "PENDING";
export const TaskStatusInProcess = "IN_PROCESS";
export const TaskStatusComplete = "COMPLETE";
export default Task;