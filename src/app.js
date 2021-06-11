require('dotenv').config()
const cloudinary = require("cloudinary");
const express = require("express");
const cors = require('cors');
const { check, validationResult } = require("express-validator")


//auth
const auth = require("./Auth/middleware");

const app = express();
app.use(cors());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//connextion
require("../db");

//Schema imported registration collections
const User = require("./model/user_register");
const Owner = require("./model/ownerRegister");
const feedback = require("./model/feedbackSchema");
const deal = require("./model/dealSchema");
const Allproperty = require("./model/allproperty")
const package = require("./model/packages");
const category = require("./model/category");
const subcategory = require("./model/subcategory");
const city = require("./model/city");
const state = require("./model/state");
const admin = require("./model/adminData");
const inqueryProp = require("./model/inquiery");
const reviewData = require("./model/reviewSchema");
var bodyParser = require('body-parser');

//port address setup
const port = process.env.PORT || 3000;

app.use(express.json(bodyParser.json({ limit: "50mb" })));

//config 

cloudinary.config({
    cloud_name: 'drz6zowp9',
    api_key: '877383498391837',
    api_secret: 'Rzg8Av03rVOYdzq4k287GUF7Ws8'
});




app.post("/api/uploadFile", async (req, res) => {
    let result = await cloudinary.uploader.upload(req.body.image, {
        public_id: `${Date.now()}`,
        resource_type: 'auto'
    })
    res.json({
        public_id: result.public_id,
        url: result.secure_url
    })

})

// app.post("/api/insertproperty", async (req, res) => {
//     const { PropertyName, Images, FullAddress, description, Price, No_of_Floors, No_of_Rooms, No_of_BeedRoom, No_of_Garage, No_of_Bathroom, No_of_Living_Room, sqrft, location, kitchen } = req.body;
//     // console.log(Images)
//     try {
//         const property = new Allproperty({
//             PropertyName, FullAddress, description, Price, No_of_Floors, No_of_Rooms, No_of_BeedRoom, No_of_Garage, No_of_Bathroom, No_of_Living_Room, sqrft, Images, location, kitchen,
//         });
//         await property.save();
//         res.status(200).send("successfully inserted");
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send("server error");
//     }
// });

    // insert a property
    app.post("/api/insertpropertyData/Patil", async (req, res) => {
        // const ownerID = req.params.id;
        const { PropertyName,FullAddress, Images,description, Price,No_of_Floors,No_of_Rooms,No_of_BeedRoom,No_of_Garage,No_of_Bathroom,No_of_Living_Room,City,ownerID  } = req.body;
        console.log(Images)
        try {
            const AddProperty = new Allproperty({
                PropertyName,ownerID,FullAddress,Images, description, Price,No_of_Floors,No_of_Rooms,No_of_BeedRoom,No_of_Garage,No_of_Bathroom,No_of_Living_Room,City
            });
            await AddProperty.save();
            res.status(200).send(AddProperty);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("server error");
        }
    });

///command add
app.post("/api/commentadd", async (req, res) => {
    const { comment, id, userName } = req.body;
    try {
        const commentadd = new reviewData({
            comment,
            propertyId: id,
            userName
        });
        await commentadd.save();
        res.status(200).send("successfully inserted");
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
});

//all propertys display
app.get("/api/propertyDisplay", async (req, res) => {
    const property = await Allproperty.find();
    try {
        if (!property) throw Error("something wrong")
        res.status("200").json(property);
    } catch {
        res.status("400").json(property);
    }
})

//all propertys display by owner
app.get("/api/propertyDisplayForOwner/:ownerID", async (req, res) => {

    const ownerID = req.params.ownerID;
    const propertyDispby = await Allproperty.find({ ownerID: ownerID });
    try {
        if (!propertyDispby) throw Error("something wrong")
        res.status("200").json(propertyDispby);
    } catch {
        res.status("400").json(propertyDispby);
    }
})

//display property by id
app.get("/api/reviewByItId/:id", async (req, res) => {
    const id = req.params.id;
    const displayDataProperty = await reviewData.find({ propertyId: id });
    try {
        if (!displayDataProperty) throw Error("something wrong")
        res.status("200").json(displayDataProperty);
    } catch {
        res.status("400").json(displayDataProperty);
    }
})

//// inqueryProp//all propertys display by owner
app.get("/api/propertyinqueryForOwner/:ownerID", async (req, res) => {

    const ownerID = req.params.ownerID;
    const findinquery = await inqueryProp.find({ ownerID: ownerID })
    try {
        res.status("200").json(findinquery);
        if (!findinquery) throw Error("something wrong")
    } catch {
        res.status("400").json(findinquery);
    }
})





//register a admin 
app.post("/api/adminRegister", async (req, res) => {
    const { email, password } = req.body;
    try {
        let adminss = await admin.findOne({ email });
        if (adminss) {
            return res.status(422).json({ error: "email is already exist" })
        }
        const adminData = new admin({
            email,
            password,
        });

        const salt = await bcrypt.genSalt(10);
        adminData.password = await bcrypt.hash(password, salt);
        await adminData.save();

    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
});
//fedback from which owner 
app.post("/api/feedbackssadd", async (req, res) => {
    const { name, email, message } = req.body;
    try {
        const feedbackadd = new feedback({
            name, email, message
        });
        await feedbackadd.save();
        res.status(200).send("successfully inserted");
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
});

//login a owner 
app.post("/api/AdminLogin", async (req, res) => {
    const { email, password } = req.body;
    try {
        const adminLog = await admin.findOne({ email });
        if (!adminLog) {
            return res.status(422).json({ error: "envalid data" })
        }
        const checkpassw = await bcrypt.compare(password, adminLog.password);
        if (!checkpassw) {
            return res.status(422).json({ error: "envalid data pass" })
        }
        const payload = {
            adminLog: {
                id: adminLog.id
            }
        }
        jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: 36000 }, (err, token) => {
            if (err) throw err;
            res.status(200).json({ token })
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
});

//login a user
app.post("/api/userLogin", async (req, res) => {
    const { email, password } = req.body;


    try {
        let userLogin = await User.findOne({ email });
        if (!userLogin) {
            return res.status(422).json({ error: "envalid data" })
        }

        const checkpass = await bcrypt.compare(password, userLogin.password);
        if (!checkpass) {
            return res.status(422).json({ error: "envalid data" })
        }

        const payload = {
            userLogin: {
                Fname: userLogin.Fname,
                email: userLogin.email
            }
        }

        jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: 36000 }, (err, token) => {
            if (err) throw err;
            res.status(200).json({ token, payload });
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
});



//register a user
app.post("/api/user-reg", async (req, res) => {
    const { Fname, Lname, email, phone, password } = req.body;
    try {
        userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(422).json({ error: "already exist" });
        } else {
            const user = new User({ Fname, Lname, email, phone, password });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();
            res.status(200).json(user);
        }
    } catch {
        res.status("400").json(reg);
    }
})


//register a owner 
app.post("/api/ownerRegister", async (req, res) => {
    const { names, email, phone, password } = req.body;
    try {
        let owner = await Owner.findOne({ email });
        if (owner) {
            return res.status(422).json({ error: "email is already exist" })
        }
        const ownerData = new Owner({
            names,
            email,
            password,
            phone,
        });

        const salt = await bcrypt.genSalt(10);
        ownerData.password = await bcrypt.hash(password, salt);
        await ownerData.save();

        const payload = {
            ownerData: {
                id: ownerData.id
            }
        }
        const user = {
            ownerDate: {
                names: ownerData.names
            }
        }

        jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: 36000 }, (err, token) => {
            if (err) throw err;
            res.status(200).json({ token })
        })

    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
});

//display
app.get("/api/categoryDisplay", async (req, res) => {
    const categorysfind = await category.find();
    try {
        if (!categorysfind) throw Error("something wrong")
        res.status("200").json(categorysfind);
    } catch {
        res.status("400").json(categorysfind);
    }
})

//delete category
app.delete("/api/deleteOcategory/:id", async function (req, res) {
    try {
        const deletecategory = await category.findByIdAndDelete(req.params.id);
        if (!req.params.id) {
            res.status("400").json(deletecategory);
        }
        res.send("successfully deleted");
    } catch {
        res.status("400").json(deletecategory);
    }
})

//login a owner 
app.post("/api/ownerLogin", async (req, res) => {
    const { email, password } = req.body;
    try {
        let owner = await Owner.findOne({ email });
        if (!owner) {
            return res.status(422).json({ error: "envalid data" })
        }

        const checkpass = await bcrypt.compare(password, owner.password);
        if (!checkpass) {
            return res.status(422).json({ error: "envalid data" })
        }

        const payload = {
            owner: {
                id: owner.id
            }
        }

        const data = {
            id: owner.id,
            status: owner.status,
            name: owner.names
        }

        jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.status(200).json({ data, token })
        })

    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
});





//all state display
app.get("/api/statedisp", async (req, res) => {
    const statecat = await state.find();
    try {
        if (!statecat) throw Error("something wrong")
        res.status("200").json(statecat);
    } catch {
        res.status("400").json(statecat);
    }
})

//dellete state
app.delete("/api/deletestate/:id", async function (req, res) {
    try {
        const deletestate = await state.findByIdAndDelete(req.params.id);
        if (!req.params.id) {
            res.status("400").json(deletestate);
        }
        res.send(deletestate);
    } catch {
        res.status("400").json(deletestate);
    }
})

//insert city
app.post("/api/cityadd", async (req, res) => {
    const { states, citys } = req.body;
    try {
        const cityadd = new city({
            states, citys
        });
        await cityadd.save();
        res.status("200").send("successfully inserted");
    } catch (err) {
        console.error(err.message);
        res.status("500").send("server error");
    }
});

//delete city
app.delete("/api/deletecityy/:id", async function (req, res) {
    try {
        const deletecitys = await city.findByIdAndDelete(req.params.id);
        if (!req.params.id) {
            res.status("400").json(deletecitys);
        }
        res.send(deletecitys);
    } catch {
        res.status("400").json(deletecitys);
    }
})

//all city display
app.get("/api/citydisp", async (req, res) => {
    const citycat = await city.find();
    try {
        if (!citycat) throw Error("something wrong")
        res.status("200").json(citycat);
    } catch {
        res.status("400").json(citycat);
    }
})

//insert property
app.post("/api/insertcategory", async (req, res) => {
    const { name } = req.body;
    try {
        const categorys = new category({
            name,
        });
        await categorys.save();
        const body = {
            success: true,
            message: 'successfully inserted',
            error: ''
        }
        res.status(200).send(body);
    } catch (err) {
        console.error(err.code);
        if (err.code == 11000) {
            const body = {
                success: false,
                error: `Duplicate data ${err.keyValue.name}`
            }
            res.status(400).send(body)
        } else {
            res.status(500).send("server error");
        }
    }
});

//insert state
app.post("/api/stateadd", async (req, res) => {
    const { country, states } = req.body;
    try {
        const stateadds = new state({
            country, states
        });
        await stateadds.save();
        res.status(200).send("successfully inserted");
    } catch (err) {
        res.status(500).send("server error");
    }
});


//all packages manage by admin  
app.post("/api/packageadd", async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, duration, no_of_ads, amount, description } = req.body;
    try {
        const packages = new package({
            name,
            duration,
            no_of_ads,
            amount,
            description,
        });
        await packages.save();
        const body = {
            success: true,
            message: 'successfully inserted',
            error: ''
        }
        res.status(200).send(body);
    } catch (err) {
        console.error(err.code);
        if (err.code == 11000) {
            const body = {
                success: false,
                error: `Duplicate data ${err.keyValue.name}`
            }
            res.status(400).send(body)
        } else {
            res.status(500).send("server error");
        }
    }
});

//insert subcategory
app.post("/api/subcategoryadd", async (req, res) => {
    const { names, category } = req.body;
    try {
        const subcategoryadd = new subcategory({
            names, category
        });
        const body = {
            success: true,
            message: 'successfully inserted',
            error: ''
        }
        await subcategoryadd.save();
        res.status(200).send(body);
    } catch (err) {
        console.error(err.message);
        if (err.code == 11000) {
            const body = {
                success: false,
                error: `Duplicate data ${err.keyValue.names}`
            }
            res.status(400).send(body)
        } else {
            res.status(500).send("server error");
        }
    }
})




//delete package
app.delete("/api/deletePackage/:_id", async function (req, res) {
    try {
        const deletepackage = await package.findByIdAndDelete(req.params._id);
        if (!req.params._id) {
            res.status("400").json(deletepackage);
        }
        res.send("successfully deleted");
    } catch {
        res.status("400").json(deletepackage);
    }
})



//display owner details on any  where 
app.get("/api/ownerDisplay", async (req, res) => {
    const ownerD = await Owner.find();
    try {
        if (!ownerD) throw Error("something wrong")
        res.status("200").json(ownerD);
    } catch {
        res.status("400").json(ownerD);
    }
})


//display package
app.get("/api/packageDisplay", async (req, res) => {
    const pack = await package.find();
    try {
        if (!pack) throw Error("something wrong")
        res.status("200").json(pack);
    } catch {
        res.status("400").json(pack);
    }
})


//all subcategory display
app.get("/api/subcategorydisp", async (req, res) => {
    const subcat = await subcategory.find();
    try {
        if (!subcat) throw Error("something wrong")
        res.status("200").json(subcat);
    } catch {
        res.status("400").json(subcat);
    }
})





//delete subcategory
app.delete("/api/deletesubcategory/:id", async function (req, res) {
    try {
        const deletesubcategory = await subcategory.findByIdAndDelete(req.params.id);
        if (!req.params.id) {
            res.status("400").json(deletesubcategory);
        }
        res.send(deletesubcategory);
    } catch {
        res.status("400").json(deletesubcategory);
    }
})

//delete subcategory
app.delete("/api/deletefeedback/:id", async function (req, res) {
    try {
        const deletefeedback = await feedback.findByIdAndDelete(req.params.id);
        if (!req.params.id) {
            res.status("400").json(deletefeedback);
        }
        res.send(deletefeedback);
    } catch {
        res.status("400").json(deletefeedback);
    }
})


//insert subcategory
app.post("/api/categoryadd", async (req, res) => {
    const { name } = req.body;
    try {
        const categoryadd = new category({
            name,
        });
        await categoryadd.save();
        res.status(200).send("successfully inserted");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
});




//delete category api
app.delete("/api/deletcategory/:id", async function (req, res) {
    try {
        const deletecategory = await category.findByIdAndDelete(req.params.id);
        if (!req.params.id) {
            res.status("400").json(deletecategory);
        }
        res.send(deletecategory);
    } catch {
        res.status("400").json(deletecategory);
    }
})

//owner activate
app.put("/api/updateOwner/:id/status", async function (req, res) {
    try {
        const id = req.params.id
        Owner.findByIdAndUpdate({ _id: id }, { status: true })
            .exec((err, result) => {
                if (err) return console.log(err)
                res.json("successfully activated")
            })
    } catch (err) {
        console.log(err)
        res.json({
            err: 'Invalid owner'
        })
    }
})





//ropertys single show display
app.get("/api/propertyDisplayForSingle/:_id", async (req, res) => {

    const _id = req.params._id;
    const propertyDispbybySingle = await Allproperty.findOne({ _id: _id });
    try {
        if (!propertyDispbybySingle) throw Error("something wrong")
        res.status("200").json(propertyDispbybySingle);
    } catch {
        res.status("400").json(propertyDispbybySingle);
    }
})

//update package 
app.put("/api/updatePackage/:id/details", async function (req, res) {
    try {
        const id = req.params.id
        const name = req.body.name
        const duration = req.body.duration
        const no_of_ads = req.body.no_of_ads
        const amount = req.body.amount
        const description = req.body.description

        package.findByIdAndUpdate({ _id: id }, { name, duration, no_of_ads, amount, description })
        const body = {
            success: true,
            message: 'successfully updated',
            error: ''
        }
        res.status(200).send(body);
    } catch (err) {
        console.error(err.code);
        if (err.code == 11000) {
            const body = {
                success: false,
                error: `Duplicate data ${err.keyValue.name}`
            }
            res.status(400).send(body)
        } else {
            res.status(500).send("server error");
        }
    }
})

//update password owner
app.put('/api/updatePasswordOwner/:id', async (req, res) => {
    try {
        const id = req.params.id
        const password = req.body.password

        const data = Owner.findByIdAndUpdate({ _id: id }, { password })
        res.status(200).json(data);
    } catch (err) {
        res.status(400).json(err)
        console.log(err);
    }
})

//update package 
app.put("/api/updateCategory/:id/details", async function (req, res) {
    try {
        const id = req.params.id
        const name = req.body.name

        category.findByIdAndUpdate({ _id: id }, { name })
            .exec((err, result) => {
                if (err) return console.log(err)
                res.json("successfully updated");
            })
    } catch (err) {
        console.log(err)
        res.json({
            err: 'failed to update'
        })
    }
})

//update subcategory
app.put("/api/updateSubCategory/:id/details", async function (req, res) {
    try {
        const id = req.params.id
        const names = req.body.names
        const category = req.body.category

        subcategory.findByIdAndUpdate({ _id: id }, { names, category })
            .exec((err, result) => {
                if (err) return console.log(err)
                res.json("successfully updated")
            })
    } catch (err) {
        console.log(err)
        res.json({
            err: 'failed to update'
        })
    }
})

//update state
app.put("/api/updateState/:id/details", async function (req, res) {
    try {
        const id = req.params.id
        const states = req.body.states
        const country = req.body.country

        state.findByIdAndUpdate({ _id: id }, { states, country })
            .exec((err, result) => {
                if (err) return console.log(err)
                res.json("successfully updated")
            })
    } catch (err) {
        console.log(err)
        res.json({
            err: 'failed to update'
        })
    }
})

//update city
app.put("/api/updateCity/:id/details", async function (req, res) {
    try {
        const id = req.params.id
        const citys = req.body.citys
        const states = req.body.states

        city.findByIdAndUpdate({ _id: id }, { states, citys })
            .exec((err, result) => {
                if (err) return console.log(err)
                res.json("successfully updated")
            })
    } catch (err) {
        console.log(err)
        res.json({
            err: 'failed to update'
        })
    }
})


//owner activate
app.put("/api/deactivateOwner/:id/status", async function (req, res) {
    try {
        const id = req.params.id
        Owner.findByIdAndUpdate({ _id: id }, { status: false })
            .exec((err, result) => {
                if (err) return console.log(err)
                res.json("successfully deactivated")
            })
    } catch (err) {
        console.log(err)
        res.json({
            err: 'Invalid owner'
        })
    }
})


//all propertys display by owner
app.get("/api/propertyDisplayOwner/:ownerID", async (req, res) => {

    const ownerID = req.params.ownerID;
    const ownerDisplayData = await Owner.find({ _id: ownerID });
    try {
        if (!ownerDisplayData) throw Error("something wrong")
        res.status("200").json(ownerDisplayData);
    } catch {
        res.status("400").json(ownerDisplayData);
    }
})


//display feedback
app.get("/api/feedbackDisplay", async (req, res) => {
    const feedbacD = await feedback.find();
    try {
        if (!feedbacD) throw Error("something wrong")
        res.status("200").json(feedbacD);
    } catch {
        res.status("400").json(feedbacD);
    }
})

//total deals will display
app.get("/api/dealDisplay", async (req, res) => {
    const dealSave = await deal.find();
    try {
        if (!dealSave) throw Error("something wrong")
        res.status("200").json(dealSave);
    } catch {
        res.status("400").json(dealSave);
    }
})

//delete owners api
app.delete("/api/deleteOwner/:id", async function (req, res) {
    try {
        const deletepackage = await Owner.findByIdAndDelete(req.params.id);
        if (!req.params.id) {
            res.status("400").json(deletepackage);
        }
        res.send("successfully deleted");
    } catch {
        res.status("400").json(deletepackage);
    }
})

//inquery property
app.post("/api/inqueryProperty", async (req, res) => {
    const { userEmail, userName, amount, message, phone, ownerID } = req.body;
    try {
        const insertData = new inqueryProp({
            userEmail, userName, amount, message, phone, ownerID
        })
        await insertData.save();
        res.status(200).json("successfully inserted");
    } catch {
        res.status(400).json("server error");
    }
})

//total inquiery will display
app.get("/api/inquiryDisplay", async (req, res) => {
    const dealInquery = await inqueryProp.find();
    try {
        if (!dealInquery) throw Error("something wrong")
        res.status("200").json(dealInquery);
    } catch {
        res.status("400").json(dealInquery);
    }
})

//find by id for property
app.get("/api/propertyShow", async (req, res) => {
    const findPropertyByUser = new inqueryProp.findById({ userID });
    try {
        if (!findPropertyByUser) throw Error("something wrong");
        res.status(200).json(findPropertyByUser);
    } catch {
        res.status(400).json("server error");
    }
})

app.listen(port, () => {
    console.log("port success")
})