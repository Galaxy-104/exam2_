const express = require('express')
const Product = require('../models/Product')
const expressAsyncHandler = require('express-async-handler')
const { generateToken, isAuth, isAdmin } = require('../../auth')

const router = express.Router()

// 전체 상품 조회
router.get('/', isAuth, expressAsyncHandler(async (req, res, next) => {
    const products = await Product.find({ user: req.user._id}).populate('user')
    if(products.length === 0){
        res.status(404).json({ code: 404, message: 'Fail to find products'})
    }else{
        res.json({ code: 200, products })
    }
}))

// 특정 상품 조회
router.get('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
    const product = await Product.findOne({
        user: req.user._id,
        _id: req.params.id
    })
    if(!product){
        res.status(404).json({ code: 404, message: 'Product Not Found'})
    }else{
        res.json({ code: 200, product })
    }
}))

// 상품 등록
router.post('/', isAuth, expressAsyncHandler(async (req, res, next) => {
    const searchedProducts = await Product.findOne({
        user: req.user._id,
        name: req.body.name,
    })
    if(searchedProducts){
        res.status(204).json({ code: 204, message: 'Already created'})
    }else{
        const product = new Product({
            user: req.user._id,
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            imgUrl: req.body.imgUrl
        })

        const newProduct = await product.save()
        if(!newProduct){
            res.status(401).json({ code: 401, message: "Failed to save todo"})
        }else{
            res.status(201).json({
                code: 201,
                message: 'New product created',
                newProduct
            })
        }
    }
}))

// 특정 상품 변경
router.put('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
    const product = await Product.findOne({
        user: req.user._id,
        _id: req.params.id
    })
    if(!product){
        res.status(404).json({ code: 404, message: 'Product Not Found'})
    }else{
        product.name = req.body.name || product.name
        product.description = req.body.description || product.description
        product.category = req.body.category || product.category
        product.imgUrl = req.body.imgUrl || product.imgUrl
        product.lastModifiedAt = new Date()
    }

    const updatedProduct = await product.save()
    res.json({
        code: 200,
        message: 'Product updated',
        updatedProduct
    })
}))

router.delete('/:id', expressAsyncHandler(async (req, res, next) => {
    res.json("특정 상품 삭제")
}))

module.exports = router