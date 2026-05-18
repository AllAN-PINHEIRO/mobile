import prisma from '../lib/prisma.js';
/* Este arquivo contém os serviços relacionados aos usuários, que interagem com o banco de dados para realizar operações como criação e consulta de usuários */
async function createUser(data) {
    return await prisma.user.create({
        data
    });
}



async function getAllUsers() {
    return await prisma.user.findMany();
}

async function deleteUser(id) {
    return await prisma.user.delete({
        where: { id }
    });
}

async function updateUser(id, data) {
    return await prisma.user.update({
        where: { id },
        data
    });
}

export default {
    createUser,
    getAllUsers,
    deleteUser,
    updateUser
};