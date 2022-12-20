import express from 'express';
import cors from 'cors'
import bcrypt from 'bcrypt'
import session from 'express-session';
import bodyParser from 'body-parser'
import cookieParser  from 'cookie-parser'
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors(
    {
        origin:["http://localhost:3000"],
        methods:["GET","POST"],
        credentials:true
    }))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
app.use(session(
    {
       key:"userId",
       secret:"Something Secret",
       resave:false,
       saveUnintialized:false,
       cookie:{
        expires: 60*60*24,
        secure: true 
       }
    }))

const db = mysql2.createConnection({
    host:"containers-us-west-167.railway.app",
    user:"root",
    password:"jYmv8jQ3XhujJbyGoMU5",
    database:"railway",
    port:7156
})

app.get('/',(req,res)=>{
    const sqlInsert = 'select * from user'
    db.query(sqlInsert,(err,result)=>{
        if(err) return res.json(err)
        return res.send(result)
    })
})
app.post('/signup',(req,res)=>{
    const password = req.body.password.toString();

    const user_query = 'INSERT INTO user(`name`,`emaill`,`phone`,`password`) VALUES(?)';
    bcrypt.hash(password,10,(err,hash)=>{
        if(err)
        {
             console.log(err)
        }
    const user_details = 
    [req.body.name,
    req.body.emaill,
    req.body.phone,
    hash
    ]
    db.query(user_query,[user_details],(err,data)=>{
        if(err) return res.json(err)
        return res.json("Inserted into the table")
    })
    })
    
})

app.post('/login',(req,res)=>{
    const qlogin = 'SELECT * FROM user WHERE emaill = ?'
    const isLogin = true
    db.query(qlogin,[req.body.emaill],(err,result)=>{
        if(err) return res.json(err)
        if(result.length > 0)
        {
            bcrypt.compare(req.body.password[0],result[0].password, (error,response)=>{  
                if(response)
                {
                    req.session.user = result
                    res.send(result)
                }
                else
                {
                    return res.send("Wrong Password")
                }
            })
        }
        else
        {
            return res.send("user doesn't exist")
        }
       
    })
    
})
app.get('/login',(req,res)=>{
    // res.send(`the response is the ${req.session.user}`)
    console.log(req.session.user)
    if(req.session.user)
    {
        res.send({loggedIn:true,user:req.session.user})
        console.log("now iam in inside true user")
    }
    else
    {
        res.send({loggedIn:false})
    }
})
app.post('/admissionForm',(req,res)=>{
    const formDetails = [
        req.body.email,
        Number(req.body.age[0]),
        new Date(req.body.startDate[0]),
        new Date(req.body.endDate[0]),
        Number(req.body.batch[0])]
        //["test@gmail.com",11,new Date(2022-12-15),new Date(2022-12-31),1]
    console.log(formDetails)    
    const fillForm = 'INSERT INTO payment (`email`,`age`,`startDate`,`endDate`,`batch`) VALUES(?,?,?,?,?)';
    db.query(fillForm,[req.body.email,
        Number(req.body.age[0]),
        new Date(req.body.startDate[0]),
        new Date(req.body.endDate[0]),
        Number(req.body.batch[0])],(err,result)=>{
        if(err)
        {
             return res.send(err)
        }
        return res.send(result)
    })
})
app.get('/admission',(req,res)=>{
    const paidUser = 'select * from payment';
    console.log(req.session.user)
    db.query(paidUser,(err,result)=>{
        if(err) return res.send(err)
        return res.send(result)
    })
})
app.get('/logout', function (req, res, next) {
    // logout logic
  
    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    req.session.user = null
    req.session.save(function (err) {
      if (err) next(err)
  
      // regenerate the session, which is good practice to help
      // guard against forms of session fixation
      req.session.regenerate(function (err) {
        if (err) next(err)
        res.redirect('/')
      })
    })
  }) 
app.post('/successPayment',(req,res)=>{
    const success = 'INSERT INTO successpayment(`email`,`startDate`,`endDate`,`balance`)VALUES(?,?,?,?)'
    db.query(success,[req.body.email,new Date(req.body.startDate),new Date(req.body.endDate),req.body.balance],(err,result)=>{
        if(err) return res.send(err)
        return res.send(result)
    })
})
app.get('/successPayment',(req,res)=>{
    const payusers = 'select * from successpayment';
    db.query(payusers,(err,result)=>{
        if(err) return res.send(err)
        return res.send(result)
    })
})
app.get('/batchAndpaid',(req,res)=>{
    const query = 'select sp.balance, sp.email, p.batch, sp.startDate, sp.endDate from payment as p join successpayment as sp on p.email = sp.email';
    db.query(query,(err,result)=>{
        if(err) return res.send(err)
        return  res.send(result)
    })
})  
app.post('/updatebatch',(req,res)=>{
    const deleteq = 'DELETE FROM updatebatch WHERE email = ?'
    db.query(deleteq,[req.body.email],(err,result)=>{
        if(err) return res.send(err)
        return res.send(result)
    })
})

app.post(`/update`,(req,res)=>{

    const query = 'INSERT INTO updatebatch(`email`,`batch`,`ubatch`) VALUES(?,?,?)'
    db.query(query,[req.body.email,req.body.batch,req.body.ubatch],(err,result)=>{
        if(err) return res.send(err)
        return res.send(result)
    })
})
app.get('/updatebatch',(req,res)=>{
    const query = 'select * from updatebatch'
    db.query(query,(err,result)=>{
        if(err) return res.send(err)
        return res.send(result)
    })
})
app.listen(port,()=>{
    console.log(`Running on port ${port}`)
})
