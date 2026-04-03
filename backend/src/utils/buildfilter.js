module.exports = buildFilter = (req, Id) => {
    const filter = {company : req.user.company}
    if(Id) filter._id = Id;
    if(req.user.role === 'sales_rep') filter.assignedTo = req.user._id;
    return filter;
    }