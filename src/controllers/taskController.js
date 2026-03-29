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
    const task = await Task.create({
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.dueDate,
        status: req.body.status,
        priority: req.body.priority,
        assignedTo: req.user._id,
        company: req.user.company,
    });
    res.status(201).json({
        status: "success",
        data: { task },
    });
})  

exports.updateTask = catchAsync(async(req,res,next)=>{
    const filter = buildFilter(req, req.params.id);
    delete req.body.company;
    delete req.body.assignedTo;
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
    const { status } = req.body;
    const allowedStatuses = ["pending", "in-progress", "completed"];
    if(!allowedStatuses.includes(status)){
        return next(new AppError("Invalid status value", 400));
    }
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
    const { assignedTo } = req.body;
    if(!assignedTo){
        return next(new AppError("Please provide assignedTo user id", 400));
    }
    const user = await User.findOne({
        _id: assignedTo,
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
