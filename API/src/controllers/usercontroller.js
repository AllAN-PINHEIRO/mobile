import userService from '../services/userService.js';
/* Este arquivo contém os controladores relacionados aos usuários, que recebem as requisições e interagem com os serviços para processar os dados */

/*crio o usuário e retorno o resultado da criação para o cliente*/
async function create(req, res) {
    console.log('Requisição recebida:', req.body);
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
}

/*busco todos os usuários e retorno para o cliente*/
async function getAll(req, res) {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
};

/*verifico as credenciais do usuário e retorno os dados dele (sem a senha) se estiverem corretas*/
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await userService.findUserByEmail(email);
    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const { password: _senha, ...userSemSenha } = user;
    res.status(200).json(userSemSenha);
}


/*removo um usuário com base no ID fornecido na URL e retorno um status de sucesso para o cliente*/
async function remove(req, res) {
    await userService.deleteUser(req.params.id);

    res.status(204).send();
}

/*atualizo um usuário com base no ID fornecido na URL e nos dados fornecidos no corpo da requisição, e retorno o usuário atualizado para o cliente*/
async function update(req, res) {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(user);
}

    export default {
        create,
        getAll,
        login,
        remove,
        update
    };