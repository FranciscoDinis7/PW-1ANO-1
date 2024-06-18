const { ShoppingCart, CartItem } = require("../modelos/carrinho");
const { decodeToken } = require("../Utils/TokenUtil");
const User = require("../users/user");
const { UserSchema } = require("../users/user");
const Product = require("../modelos/Produtos");

const getCart = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    const Decoded = await decodeToken(token);
    const user = await User.findOne({ _id: Decoded.id });
    console.log("User:", user);
    const carrinho = user.carrinho;
    console.log("Carrinho:", carrinho);
    const cart = await ShoppingCart.findById(carrinho);
    if (!cart) {
      const newCart = new ShoppingCart({
        items: [],
        total: 0,
        user: user._id,
      });
      await newCart.save();
      user.carrinho = newCart._id;
      await user.save();
      res.status(200).json(newCart);
    } else {
      const Cart = {
        items: cart.items,
        total: cart.total,
      };
      res.status(200).json(Cart);
    }
  } catch (error) {
    console.error("Erro ao buscar os carrinhos:", error);
  }
};

const AddCarrinho = async (req, res, next) => {
  try {
    const { productID } = req.params;
    const token = req.headers["x-access-token"];
    const Decoded = await decodeToken(token);
    console.log("Decoded:", Decoded);
    const user = await User.findOne({ name: Decoded.name });
    console.log("User:", user);
    const carrinho = user.carrinho;
    const CarrinhoUser = await ShoppingCart.findById(carrinho);
    console.log(productID);
    const productExist = await Product.findOne({ _id: productID });
    if (!productExist) {
      return res.status(404).send("Produto não encontrado");
    }

    if (CarrinhoUser === null) {
      const newCart = new ShoppingCart({
        items: [],
        total: 0,
        user: user._id,
      });
      await newCart.save();
      const newCartItem = new CartItem({
        user: user._id,
        product: productExist._id,
        quantity: 1,
        totalPrice: productExist.price,
      });
      newCartItem.quantity = 1;
      await newCartItem.save();
      newCart.items.push(newCartItem);
      const Total = newCart.items.reduce((total, Items) => {
        return total + Items.totalPrice;
      }, 0);
      newCart.total = Total;
      await newCart.save();
      user.carrinho = newCart._id;
      await user.save();
      res.status(201).send(newCart);
    } else {
      const cartItem = await CartItem.findOne({
        user: user._id,
        product: productID,
      });

      if (cartItem) {
        cartItem.quantity = 1;
        cartItem.totalPrice = productExist.price * cartItem.quantity;
        await cartItem.save();
        const itemIndex = CarrinhoUser.items.findIndex((item) =>
          item._id.equals(cartItem._id)
        );
        if (itemIndex > -1) {
          CarrinhoUser.items[itemIndex] = cartItem;
        } else {
          CarrinhoUser.items.push(cartItem);
        }

        const Total = CarrinhoUser.items.reduce((total, Items) => {
          return total + Items.totalPrice;
        }, 0);
        CarrinhoUser.total = Total;
        await CarrinhoUser.save();
        res.status(201).send(CarrinhoUser);
      } else {
        const newCart = new CartItem({
          user: user._id,
          product: productExist._id,
          quantity: 1,
          totalPrice: productExist.price,
        });
        await newCart.save();
        CarrinhoUser.items.push(newCart);
        console.log("Carrinho:", CarrinhoUser);
        const Total = CarrinhoUser.items.reduce((total, cartItem) => {
          return total + cartItem.totalPrice;
        }, 0);
        CarrinhoUser.total = Total;
        await CarrinhoUser.save();
        res.status(201).send(CarrinhoUser);
      }
    }
  } catch (error) {
    console.error("Erro ao adicionar o carrinho:", error);
    res.status(500).send("Erro ao adicionar o carrinho");
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const { productID } = req.params;
    console.log("Produto ID:", productID);
    const token = req.headers["x-access-token"];
    const Decoded = await decodeToken(token);
    const user = await User.findOne({ _id: Decoded.id });
    const carrinho = user.carrinho;
    const CarrinhoUser = await ShoppingCart.findById(carrinho);
    const cartItem = await CartItem.findOne({
      user: user._id,
      product: productID,
    });
    if (!cartItem) {
      throw new Error("Carrinho não encontrado");
    }
    await cartItem.deleteOne();
    const itemIndex = CarrinhoUser.items.findIndex((item) =>
      item._id.equals(cartItem._id)
    );
    if (itemIndex > -1) {
      CarrinhoUser.items.splice(itemIndex, 1);
    }
    const Total = CarrinhoUser.items.reduce((total, Items) => {
      return total + Items.totalPrice;
    }, 0);
    CarrinhoUser.total = Total;
    await CarrinhoUser.save();
    res.status(204).send("Produto deletado com sucesso");
  } catch (error) {
    console.error("Erro ao deletar o carrinho:", error);
    res.status(500).send("Erro ao deletar o carrinho");
  }
};

const updateCart = async (req, res, next) => {
  try {
    const { productID } = req.params;
    const { quantity } = req.body;
    console.log("Produto ID:", productID);
    const token = req.headers["x-access-token"];
    const Decoded = await decodeToken(token);
    const user = await User.findOne({ _id: Decoded.id });
    const carrinho = user.carrinho;
    const product = await Product.findById(productID);
    const CarrinhoUser = await ShoppingCart.findById(carrinho);
    const cartItem = await CartItem.findOne({
      user: user._id,
      product: productID,
    });

    if (!cartItem) {
      return res.status(400).send("Item não encontrado");
    }
    if (!CarrinhoUser) {
      return res.status(400).send("Carrinho não encontrado");
    }
    if (!product) {
      return res.status(400).send("Produto não encontrado");
    }
    if (quantity < 0) {
      return res.status(400).send("Quantidade inválida");
    }
    cartItem.quantity = quantity;
    cartItem.totalPrice = product.price * quantity;
    const itemIndex = CarrinhoUser.items.findIndex((item) =>
      item._id.equals(cartItem._id)
    );
    if (itemIndex > -1) {
      CarrinhoUser.items[itemIndex] = cartItem;
    } else {
      CarrinhoUser.items.push(cartItem);
    }

    const Total = CarrinhoUser.items.reduce((total, Items) => {
      return total + Items.totalPrice;
    }, 0);
    await cartItem.save();
    CarrinhoUser.total = Total;
    await CarrinhoUser.save();
    res.status(200).send(CarrinhoUser);
  } catch (error) {
    console.error("Erro ao atualizar o carrinho:", error);
    res.status(500).send("Erro ao atualizar o carrinho");
  }
};

module.exports = {
  getCart,
  deleteCart,
  AddCarrinho,
  updateCart,
};
