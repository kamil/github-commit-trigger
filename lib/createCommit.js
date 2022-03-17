const { GraphQLClient, gql } = require("graphql-request");
require("dotenv").config();

const GITHUB_ENDPOINT = "https://api.github.com/graphql";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPOSITORY_OWNER = process.env.REPOSITORY_OWNER;
const REPOSITORY_NAME = process.env.REPOSITORY_NAME;
const REPOSITORY_BRANCH = process.env.REPOSITORY_BRANCH || "main";
const MESSAGE = process.env.MESSAGE || "🚀 Deploy trigger";

const graphQLClient = new GraphQLClient(GITHUB_ENDPOINT, {
  headers: {
    authorization: "bearer " + GITHUB_TOKEN,
  },
});

const createCommit = () => {
  return new Promise((resolve, reject) => {
    const respositoryQuery = gql`
        {
          repository(owner: "${REPOSITORY_OWNER}", name: "${REPOSITORY_NAME}") {
            ref(qualifiedName: "refs/heads/${REPOSITORY_BRANCH}") {
              target {
                oid
              }
            }
          }
        }
      `;

    graphQLClient
      .request(respositoryQuery)
      .then((data) => {
        const repoOid = data.repository.ref.target.oid;

        const createCommitMutation = gql`
          mutation ($input: CreateCommitOnBranchInput!) {
            createCommitOnBranch(input: $input) {
              commit {
                url
              }
            }
          }
        `;

        const variables = {
          input: {
            branch: {
              repositoryNameWithOwner: `${REPOSITORY_OWNER}/${REPOSITORY_NAME}`,
              branchName: REPOSITORY_BRANCH,
            },
            message: { headline: MESSAGE },
            fileChanges: {
              additions: [],
              deletions: [],
            },
            expectedHeadOid: repoOid,
          },
        };

        graphQLClient
          .request(createCommitMutation, variables)
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  });
};

module.exports = createCommit;
