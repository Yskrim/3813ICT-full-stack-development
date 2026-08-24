function routes(app) {
	const user = {
		email: "anton",
		password: "123",
	};

	let isLoggedIn = false;

	app.get("/login", (req, res) => {
		res.sendFile(__dirname + "/www/login.html");
	});

	app.post("/login", (req, res) => {
		const { email, password } = req.body;

		if (email === user.email && password === user.password) {
			res.send({ ok: true });
			isLoggedIn = true;
		} else {
			res.send({
				ok: false,
				message:
					email === user.email ? "Incorrect password" : "Incorrect email",
			});
		}
	});

	app.get("/account", (req, res) => {
		isLoggedIn
			? res.sendFile(__dirname + "/www/account.html")
			: res.sendFile(__dirname + "/www/login.html");
	});

	app.post("/account", (req, res) => {
		const {logout} = req.body;
		if(logout){
			isLoggedIn = false;
			res.send({ ok: true });
		}
	});
}

module.exports = {
	routes,
};
