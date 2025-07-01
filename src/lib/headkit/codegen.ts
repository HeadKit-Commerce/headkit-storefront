import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [`${process.env.NEXT_PUBLIC_HEADKIT_API_GRAPHQL_ENDPOINT}`]: {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HEADKIT_API_TOKEN}`,
        },
      },
    },
  ],
  documents: "**/*.graphql",
  ignoreNoDocuments: true,
  generates: {
    "src/lib/headkit/generated/index.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-graphql-request",
      ],
      config: {
        rawRequest: true,
      },
      hooks: {
        beforeOneFileWrite: async (_file, content) => {
          const ignoreComments = [
            "/* eslint-disable @typescript-eslint/no-explicit-any */",
            "/* eslint-disable @typescript-eslint/no-unused-vars */",
          ].join("\n");
          return `${ignoreComments}\n${content}`;
        },
      },
    },
  },
};

export default config;
