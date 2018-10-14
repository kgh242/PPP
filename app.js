const memberDB=[{'no':1, 'name':'이유림', 'addr':'봉동'}
          ,{'no':2, 'name':'양진선', 'addr':'호성동'}
          ,{'no':3, 'name':'박혜란', 'addr':'영등동'} 
          ,{'no':4, 'name':'방혜원', 'addr':'인후동'} 
];

let http=require('http');
let express=require('express');
let path=require('path');
let static=require('serve-static'); // 미들웨어 함수
let bodyParser=require('body-parser');
let expressErrorHandler=require('express-error-handler');
let cookieParser=require('cookie-parser');
let expressSession=require('express-session');

let app=express();
let ch05Router=express.Router();

app.set('port', process.env.port || 80);
app.set('views', __dirname+'/views')
app.set('view engine', 'ejs');
// #0. 
app.use('/', static(__dirname+'/public'));
// end #0

// #1
app.use(cookieParser());
// end #1

// #2
app.use(expressSession({
    secret:'****',
    resave:true,
    saveUninitialized:true
}));
// end #2

// #3
app.use(bodyParser.urlencoded({extended:false}));
// end #3

// #10-1 ch05Router
ch05Router.route('/login').get((req, res)=>{
    res.redirect('/ch05/login.html');
});
ch05Router.route('/login').post((req, res)=>{
    console.log('ID : '+req.body.id);
    console.log('PW : '+req.body.pw);
    res.end();
});
ch05Router.route('/sample').get((req, res)=>{
    let model = {'name':'jjdev'};
    res.render('sample', {model:model}); // java : "sample.jsp".forward(req, res)
});

ch05Router.route('/memberList').get((req, res)=>{
    console.log('/ch05/memberList');
    res.render('ch05/memberList', {model:memberDB});
});
ch05Router.route('/member/:no').get((req, res)=>{
    console.log('no : '+req.params.no);
    let model={};
    for(let i=0; i<memberDB.length; i++) {
        if(memberDB[i].no==req.params.no) { //  ===parseInt(req.params.no)
            model = memberDB[i];
        }
    }
    res.render('ch05/member', {model:model});
});

// cookie 사용
ch05Router.route('/inputName').get((req, res)=>{
    let model=req.cookies; // 쿠키 읽기
    console.log(model);
    res.render('ch05/inputName', {model:model});
});
ch05Router.route('/inputName').post((req, res)=>{
    if(req.body.ch) {
        console.log('param ch : '+req.body.ch); // ok
        res.cookie('name', req.body.name); // 쿠키 쓰기
    }
    console.log('param name : '+req.body.name);
    res.end();
});

// session 로그인 구현
ch05Router.route('/userLogin').get((req, res)=>{
    if(req.session.userId) {
        let model=req.session.userId;
        res.redirect('/ch05/loginTest', {model:model});
    } else {
        res.render('ch05/userLogin'); 
    } 
});
ch05Router.route('/userLogin').post((req, res)=>{
    const sysId = 'admin';
    const sysPw = '1234';
    if(sysId===req.body.id && sysPw===req.body.pw) {
        req.session.userId=req.body.id;
        let model=req.session.userId;
        res.redirect('/ch05/loginTest');
    } else {
        res.redirect('/ch05/userLogin');
    }
});
ch05Router.route('/loginTest').get((req, res)=>{
    if(req.session.userId) {
        let model = req.session.userId;
        res.render('ch05/loginTest', {model:model});
    } else {
        res.redirect('/ch05/userLogin');
    }
});
ch05Router.route('/userLogout').get((req, res)=>{
    req.session.destroy();
    res.redirect('/ch05/userLogin');
});

app.use('/ch05', ch05Router);
// end #10-1


// #11
let errorHandler = expressErrorHandler({
    static:{
        '404':'./public/404.html'
    }
});
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

http.createServer(app).listen(app.get('port'), ()=>{
    let startTime = new Date();
    console.log('익스프레스 서버('+app.get('port')+')를'+startTime+'에 시작했습니다');
});