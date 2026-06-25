import api from './axiosConfig';

export const recipeService = {
    getAllRecipes: async () => {
        const response = await api.get('/recipes');
        return response.data;
    },
    
    getRecipeById: async (id) => {
        const response = await api.get(`/recipes/${id}`);
        return response.data;
    },

    getRecipesByMember: async (memberId) => {
        const response = await api.get(`/recipes/member/${memberId}`);
        return response.data;
    },
    
    createRecipe: async (recipeRequest, files) => {
        const formData = new FormData();
        
        formData.append('recipe', new Blob([JSON.stringify(recipeRequest)], {
            type: 'application/json'
        }));
        
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
        }
        
        const response = await api.post('/recipes', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    
    updateRecipe: async (id, recipeRequest, files) => {
        const formData = new FormData();
        
        formData.append('recipe', new Blob([JSON.stringify(recipeRequest)], {
            type: 'application/json'
        }));
        
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
        }
        
        const response = await api.put(`/recipes/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deleteRecipe: async (id) => {
        await api.delete(`/recipes/${id}`);
    }
};
