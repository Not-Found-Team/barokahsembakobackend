const { users } = require('../model/bundleModel')
const bcrypt = require('bcrypt')


// create user
exports.create = async (req, res) => {
    const { username, password, role } = req.body

    bcrypt.hash(password, 8).then(async hash => {
        await users.create({
            username: username,
            password: hash,
            role: role
        }).then(created => {
            res.status(200).json({
                massage: "create data success",
                data: created
            })
        }).catch(err => {
            res.status(400).json({
                massage: err
            })
        })
    })
}

// findOne user
exports.findOne = async (req, res) => {
    const { username, password } = req.body

    let user = await users.findOne({
        where: {
            username: username
        }
    })

    if (!user) res.status(400).json({ status: 401, message: "user doesn't exist" })
    else {
        bcrypt.compare(password, user.password).then(match => {
            delete user["password"];
            user = {
                id_users: user.id_users,
                role: user.role,
                username: user.username,
            }
            if (match) res.status(200).json({ status: 200, body: { item: user }, message: "WELCOME" })
            else res.status(400).json({ status: 401, message: "wrong username and password conbination" })
        })

    }

}