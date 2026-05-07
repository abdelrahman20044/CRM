const Task = require("../models/Task");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const  buildFilter  = require("../utils/buildfilter");
const User = require("../models/User");

exports.getAllTasks = catchAsync(async (req, res, next) => {
    const query = buildFilter(req);
    const features = new APIFeatures(Task.find(query), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    const tasks = await features.query.populate("assignedTo", "name email");
    res.status(200).json({
        status: "success",
        results: tasks.length,
        data: { tasks },
    }); 
})

exports.getTask = catchAsync(async(req,res,next)=>{
    const filter = buildFilter(req, req.params.id);
    const task = await Task.findOne(filter).populate("assignedTo", "name email");
    if(!task){
        return next(new AppError("No task found with this ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: { task },
    });
})

exports.createTask = catchAsync(async(req,res,next)=>{
    // req.body is already validated & whitelisted by Zod
    const task = await Task.create({
        ...req.body,
        assignedTo: req.user._id,
        createdBy: req.user._id,
        company: req.user.company,
    });
    res.status(201).json({
        status: "success",
        data: { task },
    });
})  

exports.updateTask = catchAsync(async(req,res,next)=>{
    const filter = buildFilter(req, req.params.id);
    // req.body is already whitelisted by Zod (no company/assignedTo possible)
    const task = await Task.findOneAndUpdate(filter, req.body, {
        new: true,
        runValidators: true,
    }).populate("assignedTo", "name email");
    if(!task){
        return next(new AppError("No task found with this ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: { task },
    });
})

exports.changeTaskStatus = catchAsync(async(req,res,next)=>{
    // req.body.status is guaranteed to be a valid enum value (Zod)
    const { status } = req.body;
    const filter = buildFilter(req, req.params.id);
    const update = { status };
    if(status === "completed") update.completedAt = new Date();
    const task = await Task.findOneAndUpdate(filter, update, {
        new: true,
        runValidators: true,
    }).populate("assignedTo", "name email");
    if(!task){
        return next(new AppError("No task found with this ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: { task },
    });
})

exports.assignTask = catchAsync(async(req,res,next)=>{
    // req.body.assignedTo is guaranteed to exist and be a valid ObjectId format (Zod)
    const user = await User.findOne({
        _id: req.body.assignedTo,
        company: req.user.company,
        isActive: true,
    });
    if(!user){
        return next(new AppError("User not found in your company", 404));
    }
    const filter = buildFilter(req, req.params.id);
    const task = await Task.findOneAndUpdate(
        filter,
        { assignedTo: user._id },
        { new: true, runValidators: true },
    ).populate("assignedTo", "name email");
    if(!task){
        return next(new AppError("No task found with this ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: { task },
    });
})

exports.deleteTask = catchAsync(async(req,res,next)=>{
    const filter = buildFilter(req, req.params.id);
    const task = await Task.findOneAndDelete(filter);
    if(!task){
        return next(new AppError("No task found with this ID", 404));
    }
    res.status(204).json({
        status: "success",
        data: null,
    });
})  
