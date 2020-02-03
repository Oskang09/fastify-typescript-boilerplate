import { Model, Table, Column, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({
    modelName: 'user',
    tableName: 'users',
    timestamps: true,
    freezeTableName: true,
    schema: 'ordorex'
})
class User extends Model<User> {

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number

    @Column({
        type: DataType.STRING,
        unique: true,
    })
    uid: string

    @Column(DataType.STRING)
    name: string

    @Column({
        type: DataType.STRING,
        unique: true,
    })
    email: string

    @Column(DataType.STRING)
    password: string

    @Column(DataType.STRING)
    fcm_token: string

    @Column(DataType.JSONB)
    permissions: string[]

    @CreatedAt
    createdAt: Date

    @UpdatedAt
    updatedAt: Date

    generateJwtToken(): object {
        return { id: this.id };
    }
}

export default User;