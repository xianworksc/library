/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    */
import { Books, sequelize } from "../models/Books.js";
await sequelize.sync();
const book ={
  index: async (req, res) => {
    const data = await Books.findAll();
    res.render("home", {data, success:req.session.success});
  },
  edit:async (req, res) =>{
    const {id} = req.params;
    const data = await Books.findByPk(id);
    res.render("edit", {data});
  },
  delete: async (req, res) => {
    try {
        const book = await Books.findByPk(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        await book.destroy();

        return res.json({
            message: 'Book deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete book'
        });
    }
},
  update: async (req, res) => {
    const { Name, category, author, publisher, price, pub_year } = req.body;

    await Books.update(
        { Name, category, author, publisher, price, pub_year },
        { where: { id: req.params.id } }
    );
    res.redirect('/');
},
  add: (req, res) =>{
    res.render("add");
  },
  insert: async(req, res) =>{
    const { Name, category, author, publisher, price, pub_year} = req.body;
    await Books.create({ Name, category, author, publisher, price, pub_year });
    res.redirect("/");
  }
};
export { book };