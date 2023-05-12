---
published: true
title: 'Get empowered with AWS CDK Integ Test'
cover_image:
description: ''
tags: serverless, cdk, integ-test, integ-runner, aws
series: 'Integ tests'
canonical_url:
---

Do you ever get frustrated testing your infrastructure and resources behavior only to discover errors after deployment? As a developer, I feel your pain. More so when knowing how an essential aspect of software development testing is and how a complex and time-consuming task it can be ! Enter integ-runner and aws-cdk integ-test library – two powerful testing tools developed by AWS CDK that streamline the testing process.

In this article, I'll walk you through a CDK App example repository that shows you how to implement and use these tools. By the end, you'll have a clear understanding of how AWS CDK integration tests can help you build better infrastructure with less stress!

![Meme: Un petit dev qui se prend la tete avec son infra/ses tests/son cdk](./assets/yHGn1.gif)

## Do I still need to convince you of the overall value of integ test ?

You can use unit tests to check that your dynamoDb Table or Lambda Function is correctly set, but you can't use unit tests to check that your dynamoDb Table and your lambda interact correctly with each other. That's what integration tests are for. And as nothing is more self-explainatory than a meme:

![Please, don't forget integration tests.](./assets/yHGn1.gif)

## Use the latest tools to test your AWS CDK constructs

Let's say your developping a CDK app or library. As your are working on building your constructs, at each development step, two questions are raised :

- Did I mess up my infrascture without realizing?
- Does everything that worked still work as expected?

In the context of AWS CDK integration tests, there are two types of tests that you might encounter: snapshot tests and assertion tests.

Snapshot tests are useful to check your cloufromation templates whereas assertion tests are useful for testing the behavior of the deployed resources.

![Schema: snapshot and assertion testing tools](./assets/integ_runner.png)

We will be using IntegTest library to define our integration tests. Then we will be using integ-runner in order to run and manage these tests.

## Let's dive into integ-runner

Integ runner works in two parts, the first part concerns the snapshots while the second one concerns the assertions if there are any. Here is the snapshots decision tree:

![Schema: snapshot and assertion testing tools](./assets/snapshot_testing.png)

To re-run the integration test for the failed tests you would then run:

`integ-runner --update-on-failed`

This will run the snapshot tests and collect all the failed tests. It will then re-execute the integration test for the failed tests and if successful, save the new snapshot. Snapshots testing are quite common (redux) and are often overlooked by developpers when automatically using the --update-on-failed option. While developping with CDK, the importance given to snapshots are on another dimension.

## Let’s set up our CDK app and its testing with IntegTest and integ-runner in typescript !

Let’s start from scratch by creating our CDK app project with the following command:

`npx aws-cdk init -- language typescript`

![launch `npx aws-cdk init -- language typescript` in terminal](./assets/npx_aws_cdk.png)

We need something to test, so I will create a very simple lambda in my app and then deploy it. Here is how my lambda works:

## Let's use integ test !

![launch `npx aws-cdk init -- language typescript` in terminal](./assets/npx_aws_cdk.png) Next, we are going to need to install Integ Test in our project. As we only need it for developping, we will add `@aws-cdk/integ-tests-alpha` in the package.json as a DevDependency with the following command:

`npm install @aws-cdk/integ-tests-alpha --save-dev`

You must have noticed the 'alpha' in the package name. IntegTest is still under development and breaking changes might occur in the incoming months so keep an eye open on the next AWS realeases.

Now we will create the test file in our test folder. Integ-runner looks for all files matching the naming convention of /integ.\*.js$/ in the test folder in the root(you can specify your own directory). Each test file is a self contained CDK app.

Now that we have all the theory that we need, let’s set up our first integration test with integ test !

### Writing your test with Integ Test

Create a new file named `integ.simple-lambda.ts` in your `test/` directory. This file will contain the CDK app for the integration test.

We import the required modules, create a new CDK app, and instantiate your `SimpleLambdaStack`as part of the app.

We then create an `IntegTest`instance, passing the app and the stack as a test case.

```
typescript
import { App } from "aws-cdk-lib";
import { IntegTest } from "@aws-cdk/integ-tests-alpha";
import { PiroroStack } from "../lib/piroro-stack";

const app = new App();
const stack = new PiroroStack(app, "SimpleLambdaStackIntegTest");
new IntegTest(app, "IntegTest", { testCases: [stack] });

app.synth();
```

Our test in basically a stack and it can be thus deployed with a simple cdk deploy. It focuses on deploying your app but it doesn't provide built-in support for running multiple integration tests, handling snapshot updates. But no worries, let's use integ-runner ! As explained earlier in this article, it will deploy our test stack and will take care of handling snapshots and running integration tests for us. In order to do so, just run the following command: `npx integ-runner`

![launch `npx integ-runner` in terminal](./assets/npx_integ_runner_0.png)

As you can see, our test has failed. More precisely, the snapshot testing has failed. That is no big news as we are making deliberate changes to our construct. We can therefore use the `--update-on-failed` option when launching integ-runner.

But wait, what am I testing here ? Where are the assertions that one expects in any type of test ?

Well, our test does not contain any assertion. As it is, it "only" tests the infrastructure.

Using integration tests without assertions can still serve valuable purposes, such as acting as a regression detector as you can detect any unintended changes in the infrastructure code. Additionally, integration tests can help ensure that the CDK application is deployable and that the infrastructure components work together as expected.

Integ Tests testCases attribute can take as many constructs to test as you'll be able to provide. You might need to test the same construct under different infrastructural choices/requirements. That's what the example below represents. Imagine you are creating a construct and you want to make sure that is resilient to eventual infrastructure changes. You can have a different testCase for each of these scenarios.

<iframe
  src="https://carbon.now.sh/embed?bg=rgba%28171%2C+184%2C+195%2C+1%29&t=monokai&wt=none&l=application%2Ftypescript&width=680&ds=true&dsyoff=20px&dsblur=68px&wc=true&wa=true&pv=56px&ph=56px&ln=false&fl=1&fm=Hack&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=const%2520app%2520%253D%2520new%2520App%28%29%253B%250A%250Anew%2520IntegTest%28app%252C%2520%27DifferentArchitectures%27%252C%2520%257B%250A%2520%2520testCases%253A%2520%255B%250A%2520%2520%2520%2520new%2520PiroroStack%28app%252C%2520%27Stack1%27%252C%2520%257B%250A%2520%2520%2520%2520%2520%2520architecture%253A%2520lambda.Architecture.X86_64%252C%250A%2520%2520%2520%2520%257D%29%252C%250A%2520%2520%2520%2520new%2520PiroroStack%28app%252C%2520%27Stack2%27%252C%2520%257B%250A%2520%2520%2520%2520%2520%2520architecture%253A%2520lambda.Architecture.X86_64%252C%250A%2520%2520%2520%2520%257D%29%252C%250A%2520%2520%255D%252C%250A%257D%29%253B"
  style="width: 546px; height: 409px; border:0; transform: scale(1); overflow:hidden;"
  sandbox="allow-scripts allow-same-origin">
</iframe>

(Exemple d'un truc qui crash ??) x86 and arm64 Of course, you would be a fool to still run your lambda on x86, but if you ever need a reminder on why not do that: un lien vers l'ancien article.

## IntegTest and assertions

We have previously declared a new instance of the aws cdk class IntegTest. It offers an interface that allows for registering a list of assertions that should be performed on the construct.

In the following example, we want to test that one of the lambdas that forms our construct returns what it is expected when invoked

<iframe
  src="https://carbon.now.sh/embed?bg=rgba%28171%2C+184%2C+195%2C+1%29&t=monokai&wt=none&l=application%2Ftypescript&width=680&ds=true&dsyoff=20px&dsblur=68px&wc=true&wa=true&pv=56px&ph=56px&ln=false&fl=1&fm=Hack&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=const%2520simpleLambdaInvocation%2520%253D%2520integ.assertions.invokeFunction%28%257B%250A%2520%2520%2520%2520functionName%253A%2520%2522simpleLambda%2522%252C%250A%2520%2520%2520%2520invocationType%253A%2520InvocationType.REQUEST_RESPONE%252C%250A%2520%2520%2520%2520payload%253A%2520%2522%2522%252C%250A%2520%2520%257D%29%253B%250A%250A%2520%2520simpleLambdaInvocation.expect%28%250A%2520%2520%2520%2520ExpectedResult.objectLike%28%257B%250A%2520%2520%2520%2520%2520%2520StatusCode%253A%2520200%252C%250A%2520%2520%2520%2520%2520%2520ExecutedVersion%253A%2520%2522%2524LATEST%2522%252C%250A%2520%2520%2520%2520%2520%2520Payload%253A%2520%27%2522Hello%252C%2520CDK3%21%2522%27%252C%250A%2520%2520%2520%2520%257D%29%250A%2520%2520%29%253B"
  style="width: 690px; height: 428px; border:0; transform: scale(1); overflow:hidden;"
  sandbox="allow-scripts allow-same-origin">
</iframe>

I set up a test function that takes the instanciated IntegTest object and performs invokations and assertions. This function is then called in the /integ.\*.ts$/ file.

//illustration du test testé

## Validate the deployment workflow and customize the behavior of the test runner

--update-on-failed: used to update the snapshot of a failed tes --disable-update-workflow: disables the snapshot update mechanism, which can be useful when you want to run integration tests without updating the snapshots

You can modify parameters like diff_assets, stack_update_workflow, and cdk_command_options to customize the deployment process

Sure! Here is more information about the parameters mentioned in the context:

- `diff_assets`: A boolean flag that, when set to true, causes the integ test runner to diff the assets for each stack in the test suite. This can help detect changes in the CDK application that might not be detected by `cdk diff` [Source 0](https://docs.aws.amazon.com/cdk/api/v1/python/aws_cdk.integ_tests/README.html).

- `stack_update_workflow`: A boolean flag that, when set to true, causes the integ test runner to use the `UPDATE_ROLLBACK_COMPLETE` update workflow for each stack in the test suite. This means that if the update fails, the stack will be rolled back to its previous state [Source 0](https://docs.aws.amazon.com/cdk/api/v1/python/aws_cdk.integ_tests/README.html).

- `cdk_command_options`: An object that allows you to customize the behavior of the CDK CLI commands used by the integ test runner. For example, you can set options for the `deploy` and `destroy` commands, such as setting the `require_approval` option to `NEVER` for the `deploy` command, as shown in the example in [Source 0](https://docs.aws.amazon.com/cdk/api/v1/python/aws_cdk.integ_tests/README.html).

## See also/Conclusion

Lien vers un autre article integ test

As with any new technology, the amount of community support and documentation available for the **`aws-cdk integ-test-alpha`** package can impact its usefulness. If there is a lack of support, it may be more difficult to troubleshoot issues or to find helpful resources when working with the package.

Créer plus de documentations vers integ-test-alpha pour rendre la devx plus sympa

Overall, cool mais encore pas assez mature et devx bof.
