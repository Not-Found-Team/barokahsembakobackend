const {users} = require('../model/bundleModel')
const bcrypt = require('bcrypt')


// create user
exports.create = async (req, res) => {
    const {username, password, role} = req.body

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
    const {username, password} = req.body

    const user = await users.findOne({
        where: {
            username: username
        }
    })

    if (!user) res.status(400).json({massage: "user doesn't exist"})
    else {
        bcrypt.compare(password, user.password).then(match => {
            if (match) res.status(200).json({massage: "WELCOME"})
            else res.status(400).json({massage: "wrong username and password conbination"})
        })

    }

}