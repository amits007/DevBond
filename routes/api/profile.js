const express = require('express');
const router = express.Router();
const  auth = require('../../middelware/auth');
const Profile = require('../../model/Profile')
const User = require('../../model/User')
const Post = require('../../model/Post')

const {check, validationResult} = require('express-validator/check');
const request = require('request');
const config = require('config');

router.get('/me', auth, async (req,res)=> {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user',['name', 'avatar']);

        if(!profile){
            res.status(400).json({msg: 'There is no profile for this user'});
        }

        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST api/profile
// Create User Profile

router.post('/', [ auth,[
    check('status', 'Status will be required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]
],
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {company, website, location, bio, status,githubusername, skills, youtube, facebook, twitter, instagram, linkedin} = req.body;

    //Build profile object
    const profileFeilds = {};
    profileFeilds.user = req.user.id;
    if(company) profileFeilds.company= company;
    if(website) profileFeilds.website = website;
    if(location) profileFeilds.location = location;
    if(bio) profileFeilds.bio = bio;
    if(status) profileFeilds.status = status;
    if(githubusername) profileFeilds.githubusername = githubusername;
    if(skills) {
        console.log('123')
;        profileFeilds.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFeilds.social = {}
    if(youtube) profileFeilds.social.youtube = youtube;
    if(twitter) profileFeilds.social.twitter = twitter;
    if(facebook) profileFeilds.social.facebook = facebook;
    if(linkedin) profileFeilds.social.linkedin = linkedin;
    if(instagram) profileFeilds.social.instagram = instagram;

    
    try {
        let profile= await Profile.findOne({user:req.user.id})
        if(profile) {
            //Update
            profile = await Profile.findOneAndUpdate({user:req.user.id}, {$set: profileFeilds}, {new:true});
            return res.json(profile);
        }
        

        //Create
        profile = new Profile(profileFeilds);
        await profile.save();
        res.json(profile)

    } catch(err) {
        console.error(err.message);
        res.status(400).send('Server Error')
    }
    
    }
);

// GET api/profile
// Get all Profile
router.get('/', async (req, res) => {
    try{
        const profiles = await Profile.find().populate('user', ['name','avatar']);
        res.json(profiles)
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

})

// GET api/profile/user/:user_id
// Get profile by user id
router.get('/user/:user_id', async (req, res) => {
    try{
        const profile= await Profile.findOne({user: req.params.user_id}).populate('user', ['name','avatar']);
        if(!profile) {
            return res.status(400).json({msg: 'There is no profile for this user'});
        }
        res.json(profile)
    } catch(err) {
        console.error(err.message);
        if(err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'There is no profile for this user'});
        }
        res.status(500).send('Server Error');
    }

})

// DELETE api/profile
// Delete profile users and posts
router.delete('/', auth, async (req, res) => {
    try{
        //Remove User Post
        await Post.deleteMany({user: req.user.id});

        //Remove Profile
        await Profile.findOneAndRemove({ user:req.user.id });

        //Remove User
        await User.findOneAndRemove({ _id:req.user.id });

        res.json({msg:'User Removed'})
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// PUT api/profile/experience
// Add profile experience
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty()
]], async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile);
        } catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    

});

// DELETE api/profile/experience/:exp_id
// Delete profile experience
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({user:req.user.id});
        //Get Remove Index
        const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id);
        if(removeIndex!=-1)
        profile.experience.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// PUT api/profile/education
// Add profile education
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('feildofstudy', 'Feild of Study is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty()
]], async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {
            school,
            degree,
            feildofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        const newEdu = {
            school,
            degree,
            feildofstudy,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.education.unshift(newEdu);
            await profile.save();
            res.json(profile);
        } catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    

});

// DELETE api/profile/education/:edu_id
// Delete profile education
router.delete('/education/:edu_id', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({user:req.user.id});
        //Get Remove Index
        const removeIndex = profile.education.map(item=>item.id).indexOf(req.params.edu_id);
        if(removeIndex!=-1)
        profile.education.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});


// GET api/profile/github/:username
// GET profile repo from github
router.get('/github/:username', async (req, res) => {
    try{
        const option = {
            uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubclientId')}&client_secret=${config.get('githubSecret')}`,
            method : 'GET',
            headers: {'user-agent' : 'node.js'}
        }
        request(option, (error, response, body) => {
            if(error) console.error(error);

            if(response.statusCode != 200) {
                res.status(404).json({ msg: 'No github profile found'})
            }
            res.json(JSON.parse(body))
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});


module.exports = router;