const Book = require("../models/Book");
const mongoose = require('mongoose');
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  console.log(bookObject);
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

exports.createRating = (req, res, next) => {
  console.log(req.body);
  console.log(req.headers.authorization);
  const { userId, grade } = req.body;
  console.log('on est dans createRating');

  if (grade < 0 || grade > 5) {
    return res.status(400).json({ message: "note invalide" });
  }
  console.log('vérification de validité de note');

  // Cherche le livre avec l'id
  Book.findById(req.params.id)
    .then((book) => {
      // Vérifie que l'ID de l'utilisateur correspond à l'ID de l'utilisateur du livre
      if (book.userId.toString() !== userId) {
        return res.status(403).json({ message: "Non-authorisé" });
      }
      console.log('Id correspondante');
      // Cherche la note de cet utilisateur
      const userGrade = book.ratings.find(
        (r) => r.userId.toString() === userId
      );
      console.log("Recherche de la note de l'utilisateur");
      if (userGrade) {
        // Si l'utilisateur a déjà noté le livre, met à jour sa note
        userGrade.grade = grade;
        book.markModified('ratings');
      } else {
        // Sinon, ajoute la note de l'utilisateur
        book.ratings.push({ userId, grade });
      }
      console.log('note à jour/ ajout de note');

      // Met à jour la note moyenne du livre
      const totalGrade = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      book.averageRating = totalGrade / book.ratings.length;

      console.log(totalGrade);
      return book.save();
    })
    
    
    .then(() => res.status(200).json({ message: "note mise à jour avec succès !" }))
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        // Gère le cas où l'ID du livre n'est pas un ID MongoDB valide
        return res.status(400).json({ message: "non valide" });
      } else if (error instanceof mongoose.Error.ValidationError) {
        // Gère le cas où la note est invalide
        return res.status(400).json({ message: "note invalide" });
      }

      // Si l'erreur est inconnue, renvoie une erreur 500
      return res.status(500).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-authorisé" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Livre modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-authorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBook = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
