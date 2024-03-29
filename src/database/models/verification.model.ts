module.exports = (sequelize : any, DataTypes: any) => {
    return sequelize.define('verification', {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId:{
            type:DataTypes.STRING
        },
        type:{
            type:DataTypes.STRING
        },
        code:{
            type:DataTypes.STRING
        }
    },{
        timestamps: true
    });
};