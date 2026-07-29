import modeloBikeService from '../services/modeloBikeService.js';
/* Este arquivo contém os controladores relacionados ao catálogo de modelos de bike */

/*busco modelos que contenham o termo digitado, usado no autocomplete do app*/
async function search(req, res) {
    const termo = req.query.q || '';
    if (!termo) {
        return res.status(200).json([]);
    }

    const modelos = await modeloBikeService.searchModelos(termo);
    res.status(200).json(modelos);
}

export default {
    search
};
