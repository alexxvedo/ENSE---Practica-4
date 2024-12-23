import { useEffect, useState } from "react";

import API from "../api";

export function useMovies(query = {}) {
  const [data, setData] = useState({
    _embedded: { movieList: [] },
    page: { totalPages: 1, number: 0 },
  });
  const queryString = JSON.stringify(query);

  useEffect(() => {
    API.instance()
      .findMovies(JSON.parse(queryString))
      .then((data) => {
        console.log("useMovies - Raw API response:", data);
        // La API devuelve directamente la estructura correcta, así que la usamos tal cual
        setData(data);
      })
      .catch((error) => {
        console.error("useMovies - Error:", error);
        setData({
          _embedded: { movieList: [] },
          page: { totalPages: 1, number: 0 },
        });
      });
  }, [queryString]);

  return data;
}

export function useMovie(id = "") {
  const [data, setData] = useState({});

  useEffect(() => {
    API.instance().findMovie(id).then(setData);
  }, [id]);

  const update = async (movieData) => {
    try {
      const updatedMovie = await API.instance().updateMovie(id, movieData);
      setData(updatedMovie);
      return updatedMovie;
    } catch (error) {
      console.error("Error updating movie:", error);
      throw error;
    }
  };

  return { movie: data, update };
}

export function useUser(id = null) {
  const [data, setData] = useState(null);
  const userId = id === null ? localStorage.getItem("user") : id;

  console.log("Ejecutando useUser", userId);

  const fetchUser = async () => {
    if (userId) {
      try {
        const user = await API.instance().findUser(userId);
        if (user) {
          setData(user);
          console.log("User refreshed", user);
        }
        return user;
      } catch (error) {
        console.error("Error refreshing user:", error);
        setData(null);
        return null;
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const create = (user) =>
    API.instance()
      .createUser(user)
      .then((user) => setData(user));

  const update = async (patches) => {
    try {
      const updatedUser = await API.instance().updateUser(userId, patches); // Asegúrate de usar userId
      setData(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  return {
    user: data,
    create,
    update,
    fetchUser,
  };
}

export function useComments(query = {}) {
  const [data, setData] = useState({
    content: [],
    pagination: { hasNext: false, hasPrevious: false },
  });
  const queryString = JSON.stringify(query);

  console.log("useComments - query:", query);
  console.log("useComments - queryString:", queryString);

  useEffect(() => {
    API.instance()
      .findComments(JSON.parse(queryString))
      .then((comments) => {
        if (!comments) {
          console.log("No se encontro al user :(");
        } else {
          setData(comments);
          console.log("Comments", comments);
        }
      });
  }, [queryString]);

  const create = (comment) => {
    comment.user = {
      email: localStorage.getItem("user"),
    };

    console.log("comment", comment);
    API.instance()
      .createComment(comment)
      .then(() => {
        API.instance().findComments(query).then(setData);
      });
  };

  return {
    comments: data,
    createComment: create,
  };
}

/**
 * Hook para obtener la lista de amigos de un usuario.
 *
 * @returns {
 *   friends: Usuario[], // Lista de amigos del usuario
 *   loading: boolean, // Indica si se esta cargando la lista de amigos
 *   error: string | null, // Error al cargar la lista de amigos
 *   addFriend: (userId: string) => Promise<void>, // Agrega un amigo a la lista de amigos
 *   removeFriend: (userId: string) => Promise<void>, // Elimina un amigo de la lista de amigos
 *   refresh: () => Promise<void>, // Refresca la lista de amigos
 * }
 */
export function useFriends() {
  const [error, setError] = useState(null);

  const addFriend = async (email, name) => {
    try {
      const api = new API();
      await api.addFriend(email, name);
    } catch (err) {
      setError(err.message);
    }
  };

  const removeFriend = async (userId) => {
    try {
      const api = new API();
      await api.removeFriend(userId);
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    error,
    addFriend,
    removeFriend,
  };
}
