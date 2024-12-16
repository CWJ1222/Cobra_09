const Category = (sequelize, DataTypes) =>{
    const category = sequelize.define (
        "category",
        {
            category_id : {
                type : DataTypes.INTEGER,
                primaryKey : true,
                allowNull : false,
            },
            category_name : {
                type : DataTypes.STRING(255),
                allowNull : false,
            },

        }, {
            freezeTableName : true,
            timestamps: false,
        },
    );
    return category;
}

module.exports = Category;