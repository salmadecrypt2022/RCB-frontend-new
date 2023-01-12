const controllers = {};

controllers.dashboard = (req, res) => {
    return res.render('Admin/dashboard', {
        req: req,
        res: res
    });
}

controllers.profile = (req, res) => {
    return res.render('Admin/profile', {
        req: req,
        res: res
    });
}

controllers.users = (req, res) => {
    return res.render('Admin/users', {
        req: req,
        res: res
    });
}
controllers.categories = (req, res) => {
    return res.render('Admin/categories', {
        req: req,
        res: res
    });
}

controllers.reserves = (req, res) => {
    return res.render('Admin/reserves', {
        req: req,
        res: res
    });
}


controllers.signin = (req, res) => {
    return res.render('Admin/signin', {
        req: req,
        res: res
    });
}

controllers.forgotPassword = (req, res) => {
    return res.render('Admin/forgotPassword')
};

module.exports = controllers;