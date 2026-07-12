import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: [true, 'Repository name is required'],
        trim: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    sourceUrl: {
	type: String,
	default: '',
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
    },
    stars: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    forks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Repository',
        },
    ],
    forkedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository',
        default: null,
    },
    defaultBranch: {
        type: String,
        default: 'main',
    },
    language: {
        type: String,
        default: '',
    },
    topics: {
        type: [String],
        default: [],
    },
    collaborators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    prCount: {
        type: Number,
        default: 0,
    },
},
    { timestamps: true }
);

repositorySchema.index({ owner: 1, name: 1}, {unique: true});
repositorySchema.index(
  { name: 'text', description: 'text', language: 'text', topics: 'text' },
  { language_override: 'lang' }
);

const Repository = mongoose.model('Repository', repositorySchema);
export default Repository;
